'use client'

import { useState, useEffect } from 'react'
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
import { Deal, DealStage, Company, Contact } from '@/types'

interface CreateDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (deal: Deal) => void
}

const STAGES: { value: DealStage; label: string }[] = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
]

export function CreateDealDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDealDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'LEAD' as DealStage,
    probability: '0',
    companyId: '',
    contactId: '',
    expectedCloseDate: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, contactsRes] = await Promise.all([
          fetch('/api/companies?limit=100'),
          fetch('/api/contacts?limit=100'),
        ])

        if (companiesRes.ok) {
          const data = await companiesRes.json()
          setCompanies(data.data)
        }
        if (contactsRes.ok) {
          const data = await contactsRes.json()
          setContacts(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          value: parseFloat(formData.value) || 0,
          stage: formData.stage,
          probability: parseInt(formData.probability) || 0,
          companyId: formData.companyId || null,
          contactId: formData.contactId || null,
          expectedCloseDate: formData.expectedCloseDate || null,
        }),
      })

      if (res.ok) {
        const deal = await res.json()
        onSuccess(deal)
        toast.success('Deal created successfully')
        setFormData({
          title: '',
          value: '',
          stage: 'LEAD',
          probability: '0',
          companyId: '',
          contactId: '',
          expectedCloseDate: '',
        })
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create deal')
      }
    } catch (error) {
      console.error('Failed to create deal:', error)
      toast.error('Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription>
            Add a new deal to your pipeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Enter deal title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Probability</label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.probability}
                onChange={(e) =>
                  setFormData({ ...formData, probability: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stage</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.stage}
              onChange={(e) =>
                setFormData({ ...formData, stage: e.target.value as DealStage })
              }
            >
              {STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.companyId}
              onChange={(e) =>
                setFormData({ ...formData, companyId: e.target.value })
              }
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contact</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.contactId}
              onChange={(e) =>
                setFormData({ ...formData, contactId: e.target.value })
              }
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Close Date</label>
            <Input
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) =>
                setFormData({ ...formData, expectedCloseDate: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
