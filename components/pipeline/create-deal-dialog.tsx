'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HoverTooltip } from '@/components/ui/tooltip'
import { Deal, DealStage, Company, Contact, Task } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { 
  Search, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  Percent,
  Plus,
  X,
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react'

interface CreateDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (deal: Deal) => void
}

const STAGES: { value: DealStage; label: string; probability: number; description: string }[] = [
  { value: 'LEAD', label: 'Lead', probability: 10, description: 'Initial contact made' },
  { value: 'QUALIFIED', label: 'Qualified', probability: 25, description: 'Needs verified' },
  { value: 'PROPOSAL', label: 'Proposal', probability: 50, description: 'Proposal sent' },
  { value: 'NEGOTIATION', label: 'Negotiation', probability: 75, description: 'In negotiations' },
  { value: 'CLOSED_WON', label: 'Closed Won', probability: 100, description: 'Deal won!' },
  { value: 'CLOSED_LOST', label: 'Closed Lost', probability: 0, description: 'Deal lost' },
]

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
]

interface FormErrors {
  title?: string
  value?: string
  company?: string
  contact?: string
}

export function CreateDealDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDealDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  
  // Search states
  const [companySearch, setCompanySearch] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  
  // Refs for click outside
  const companyDropdownRef = useRef<HTMLDivElement>(null)
  const contactDropdownRef = useRef<HTMLDivElement>(null)
  
  // Task creation
  const [createTask, setCreateTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    currency: 'USD',
    stage: 'LEAD' as DealStage,
    probability: 10,
    companyId: '',
    companyName: '',
    contactId: '',
    contactName: '',
    expectedCloseDate: '',
    notes: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Fetch companies and contacts
  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, contactsRes] = await Promise.all([
          fetch('/api/companies?limit=100'),
          fetch('/api/contacts?limit=100'),
        ])

        if (companiesRes.ok) {
          const data = await companiesRes.json()
          setCompanies(data.data || [])
        }
        if (contactsRes.ok) {
          const data = await contactsRes.json()
          setContacts(data.data || [])
          setFilteredContacts(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    if (open) {
      // Reset form when dialog opens
      setFormData({
        title: '',
        value: '',
        currency: 'USD',
        stage: 'LEAD' as DealStage,
        probability: 10,
        companyId: '',
        companyName: '',
        contactId: '',
        contactName: '',
        expectedCloseDate: '',
        notes: '',
      })
      setErrors({})
      setCompanySearch('')
      setContactSearch('')
      fetchData()
    }
  }, [open])
  
  // Filter contacts when company is selected
  useEffect(() => {
    if (formData.companyId) {
      const companyContacts = contacts.filter(c => c.companyId === formData.companyId)
      setFilteredContacts(companyContacts)
      // Reset contact if not associated with selected company
      if (formData.contactId) {
        const isAssociated = companyContacts.some(c => c.id === formData.contactId)
        if (!isAssociated) {
          setFormData(prev => ({ ...prev, contactId: '', contactName: '' }))
        }
      }
    } else {
      setFilteredContacts(contacts)
    }
  }, [formData.companyId, contacts])
  
  // Filter companies by search
  const filteredCompanies = companySearch
    ? companies.filter(c => 
        c.name.toLowerCase().includes(companySearch.toLowerCase())
      )
    : companies
  
  // Filter contacts by search
  const searchedContacts = contactSearch
    ? filteredContacts.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(contactSearch.toLowerCase())
      )
    : filteredContacts
  
  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false)
      }
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Auto-calculate probability based on stage
  const handleStageChange = (stage: DealStage) => {
    const stageInfo = STAGES.find(s => s.value === stage)
    setFormData(prev => ({
      ...prev,
      stage,
      probability: stageInfo?.probability || prev.probability
    }))
  }
  
  // Validate form
  const validateForm = () => {
    const titleValue = formData.title
    const valueValue = formData.value
    const newErrors: FormErrors = {}
    
    if (!titleValue || titleValue.trim().length === 0) {
      newErrors.title = 'Deal title is required'
    }
    
    // Validate value - must be empty (optional), or a valid positive number
    if (valueValue !== '') {
      const value = parseFloat(valueValue)
      if (isNaN(value) || value < 0) {
        newErrors.value = 'Please enter a valid positive number'
      }
    }
    
    setErrors(newErrors)
    return { valid: Object.keys(newErrors).length === 0, errors: newErrors }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[Deal Form] Submit started')
    console.log('[Deal Form] Form data before validation:', JSON.stringify(formData))
    
    const validation = validateForm()
    if (!validation.valid) {
      console.log('[Deal Form] Validation failed, errors:', JSON.stringify(validation.errors))
      toast.error('Please fix the form errors')
      return
    }
    
    console.log('[Deal Form] Validation passed, proceeding to create deal')
    setLoading(true)

    try {
      // Ensure value is a number, default to 0 if empty or invalid
      const numValue = formData.value === '' ? 0 : parseFloat(formData.value)
      const finalValue = isNaN(numValue) ? 0 : numValue
      
      console.log('[Deal Form] Final payload:', JSON.stringify({
        title: formData.title,
        value: finalValue,
        currency: formData.currency,
        stage: formData.stage,
        probability: formData.probability,
        companyId: formData.companyId || null,
        contactId: formData.contactId || null,
        expectedCloseDate: formData.expectedCloseDate || null,
      }))
      
      // Create the deal first
      const dealRes = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          value: finalValue,
          currency: formData.currency,
          stage: formData.stage,
          probability: formData.probability,
          companyId: formData.companyId || null,
          contactId: formData.contactId || null,
          expectedCloseDate: formData.expectedCloseDate || null,
          notes: formData.notes || null,
        }),
      })

      console.log('[Deal Form] API Response status:', dealRes.status)

      if (dealRes.ok) {
        const deal = await dealRes.json()
        console.log('[Deal Form] Deal created successfully:', deal)
        
        // Create task if requested
        if (createTask && taskTitle.trim()) {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: taskTitle,
              dueDate: taskDueDate || null,
              priority: taskPriority,
              dealId: deal.id,
            }),
          })
        }
        
        onSuccess(deal)
        toast.success('Deal created successfully!')
        
        // Reset form
        setFormData({
          title: '',
          value: '',
          currency: 'USD',
          stage: 'LEAD',
          probability: 10,
          companyId: '',
          companyName: '',
          contactId: '',
          contactName: '',
          expectedCloseDate: '',
          notes: '',
        })
        setCompanySearch('')
        setContactSearch('')
        setCreateTask(false)
        setTaskTitle('')
        setTaskDueDate('')
        setTaskPriority('medium')
        setErrors({})
      } else {
        const error = await dealRes.json()
        console.log('[Deal Form] API Error response:', JSON.stringify(error))
        // Show more detailed error message
        if (error.details && Array.isArray(error.details)) {
          const errorMessages = error.details.map((e: { path: string[], message: string }) => 
            `${e.path.join('.')}: ${e.message}`
          ).join(', ')
          toast.error(`Validation error: ${errorMessages}`)
        } else {
          toast.error(error.error || 'Failed to create deal')
        }
      }
    } catch (error) {
      console.error('[Deal Form] Catch error:', error)
      toast.error('Failed to create deal')
    } finally {
      setLoading(false)
    }
  }
  
  // Select company
  const selectCompany = (company: Company) => {
    setFormData(prev => ({
      ...prev,
      companyId: company.id,
      companyName: company.name,
      contactId: '', // Reset contact when company changes
      contactName: '',
    }))
    setCompanySearch(company.name)
    setShowCompanyDropdown(false)
  }
  
  // Select contact
  const selectContact = (contact: Contact) => {
    setFormData(prev => ({
      ...prev,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
    }))
    setContactSearch(`${contact.firstName} ${contact.lastName}`)
    setShowContactDropdown(false)
  }
  
  // Clear company selection
  const clearCompany = () => {
    setFormData(prev => ({
      ...prev,
      companyId: '',
      companyName: '',
      contactId: '',
      contactName: '',
    }))
    setCompanySearch('')
    setFilteredContacts(contacts)
  }
  
  // Clear contact selection
  const clearContact = () => {
    setFormData(prev => ({
      ...prev,
      contactId: '',
      contactName: '',
    }))
    setContactSearch('')
  }

  // Get currency symbol
  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Deal
          </DialogTitle>
          <DialogDescription>
            Add a new deal to your pipeline. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Deal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              Deal Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter deal title (e.g., Enterprise License - Acme Corp)"
              value={formData.title}
              onChange={(e) => {
                const newTitle = e.target.value
                setFormData(prev => ({ ...prev, title: newTitle }))
                // Clear error when user starts typing
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: undefined }))
                }
              }}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Value and Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Deal Value
              </label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className={errors.value ? 'border-red-500' : ''}
              />
              {errors.value && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.value}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pipeline Stage</label>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.filter(s => s.value !== 'CLOSED_LOST').map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => handleStageChange(stage.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.stage === stage.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium text-sm">{stage.label}</div>
                  <div className="text-xs text-muted-foreground">{stage.probability}%</div>
                </button>
              ))}
            </div>
          </div>

          {/* Probability */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Percent className="h-4 w-4" />
              Probability <span className="text-muted-foreground font-normal">({formData.probability}%)</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.probability}
              onChange={(e) =>
                setFormData({ ...formData, probability: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Company Selection with Search */}
          <div className="space-y-2" ref={companyDropdownRef}>
            <label className="text-sm font-medium flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Company
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value)
                    setShowCompanyDropdown(true)
                    if (!e.target.value) {
                      clearCompany()
                    }
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="pl-9 pr-20"
                />
                {formData.companyId && (
                  <button
                    type="button"
                    onClick={clearCompany}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {showCompanyDropdown && filteredCompanies.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCompanies.slice(0, 10).map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => selectCompany(company)}
                      className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.industry && (
                          <div className="text-xs text-muted-foreground">{company.industry}</div>
                        )}
                      </div>
                      {formData.companyId === company.id && (
                        <Check className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Selection with Search */}
          <div className="space-y-2" ref={contactDropdownRef}>
            <label className="text-sm font-medium flex items-center gap-1">
              <User className="h-4 w-4" />
              Contact
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={formData.companyId ? "Search contacts in selected company..." : "Search all contacts..."}
                  value={contactSearch}
                  onChange={(e) => {
                    setContactSearch(e.target.value)
                    setShowContactDropdown(true)
                    if (!e.target.value) {
                      clearContact()
                    }
                  }}
                  onFocus={() => setShowContactDropdown(true)}
                  className="pl-9 pr-20"
                  disabled={!formData.companyId && contacts.length === 0}
                />
                {formData.contactId && (
                  <button
                    type="button"
                    onClick={clearContact}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {showContactDropdown && searchedContacts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchedContacts.slice(0, 10).map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => selectContact(contact)}
                      className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.position && (
                          <div className="text-xs text-muted-foreground">{contact.position}</div>
                        )}
                      </div>
                      {contact.company && (
                        <div className="text-xs text-muted-foreground ml-auto">
                          {contact.company.name}
                        </div>
                      )}
                      {formData.contactId === contact.id && (
                        <Check className="h-4 w-4 ml-2 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expected Close Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Expected Close Date
            </label>
            <Input
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) =>
                setFormData({ ...formData, expectedCloseDate: e.target.value })
              }
            />
            {formData.expectedCloseDate && (
              <p className="text-xs text-muted-foreground">
                {new Date(formData.expectedCloseDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Quick Task Creation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <HoverTooltip content="Create a follow-up task when this deal is created">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Create Follow-up Task
                </label>
              </HoverTooltip>
              <button
                type="button"
                onClick={() => setCreateTask(!createTask)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  createTask ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    createTask ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {createTask && (
              <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                <Input
                  placeholder="Task title (e.g., Follow up call)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    placeholder="Due date"
                  />
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Deal Preview */}
          {formData.title && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Deal Preview</h4>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{formData.title}</span>
                <span className="text-lg font-bold text-primary">
                  {formData.value ? `${getCurrencySymbol(formData.currency)}${parseFloat(formData.value).toLocaleString()}` : '$0'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {formData.companyName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {formData.companyName}
                  </span>
                )}
                {formData.contactName && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {formData.contactName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {formData.probability}% probability
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <HoverTooltip content="Cancel and close this dialog">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </HoverTooltip>
            <HoverTooltip content="Create this deal and add it to your pipeline">
              <div className="inline-block">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Deal
                    </>
                  )}
                </Button>
              </div>
            </HoverTooltip>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
