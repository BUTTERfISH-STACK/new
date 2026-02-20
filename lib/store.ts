import { create } from 'zustand'
import { Deal, Company, Contact, Task, Activity, DealStage } from '@/types'

interface AppState {
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Cached data
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  addDeal: (deal: Deal) => void
  updateDeal: (id: string, data: Partial<Deal>) => void
  removeDeal: (id: string) => void
  
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, data: Partial<Company>) => void
  removeCompany: (id: string) => void
  
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  updateContact: (id: string, data: Partial<Contact>) => void
  removeContact: (id: string) => void
  
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, data: Partial<Task>) => void
  removeTask: (id: string) => void
  
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  addActivity: (activity: Activity) => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Deals
  deals: [],
  setDeals: (deals) => set({ deals }),
  addDeal: (deal) => set((state) => ({ deals: [deal, ...state.deals] })),
  updateDeal: (id, data) => set((state) => ({
    deals: state.deals.map((d) => d.id === id ? { ...d, ...data } : d)
  })),
  removeDeal: (id) => set((state) => ({
    deals: state.deals.filter((d) => d.id !== id)
  })),
  
  // Companies
  companies: [],
  setCompanies: (companies) => set({ companies }),
  addCompany: (company) => set((state) => ({ companies: [company, ...state.companies] })),
  updateCompany: (id, data) => set((state) => ({
    companies: state.companies.map((c) => c.id === id ? { ...c, ...data } : c)
  })),
  removeCompany: (id) => set((state) => ({
    companies: state.companies.filter((c) => c.id !== id)
  })),
  
  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) => set((state) => ({ contacts: [contact, ...state.contacts] })),
  updateContact: (id, data) => set((state) => ({
    contacts: state.contacts.map((c) => c.id === id ? { ...c, ...data } : c)
  })),
  removeContact: (id) => set((state) => ({
    contacts: state.contacts.filter((c) => c.id !== id)
  })),
  
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, data) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...data } : t)
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  
  // Activities
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({ 
    activities: [activity, ...state.activities].slice(0, 20) 
  })),
  
  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))

// Pipeline store for Kanban
interface PipelineState {
  dealsByStage: Record<DealStage, Deal[]>
  setDealsByStage: (deals: Deal[]) => void
  moveDeal: (dealId: string, newStage: DealStage) => void
}

export const usePipelineStore = create<PipelineState>((set) => ({
  dealsByStage: {
    LEAD: [],
    QUALIFIED: [],
    PROPOSAL: [],
    NEGOTIATION: [],
    CLOSED_WON: [],
    CLOSED_LOST: [],
  },
  setDealsByStage: (deals) => {
    const dealsByStage: Record<DealStage, Deal[]> = {
      LEAD: [],
      QUALIFIED: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      CLOSED_WON: [],
      CLOSED_LOST: [],
    }
    
    deals.forEach((deal) => {
      dealsByStage[deal.stage].push(deal)
    })
    
    set({ dealsByStage })
  },
  moveDeal: (dealId, newStage) => set((state) => {
    const newDealsByStage = { ...state.dealsByStage }
    let movedDeal: Deal | undefined
    
    // Find and remove deal from current stage
    for (const stage of Object.keys(newDealsByStage) as DealStage[]) {
      const stageDeals = newDealsByStage[stage]
      const dealIndex = stageDeals.findIndex((d) => d.id === dealId)
      if (dealIndex !== -1) {
        movedDeal = { ...stageDeals[dealIndex], stage: newStage }
        newDealsByStage[stage] = [
          ...stageDeals.slice(0, dealIndex),
          ...stageDeals.slice(dealIndex + 1),
        ]
        break
      }
    }
    
    // Add to new stage
    if (movedDeal) {
      newDealsByStage[newStage] = [...newDealsByStage[newStage], movedDeal]
    }
    
    return { dealsByStage: newDealsByStage }
  }),
}))
