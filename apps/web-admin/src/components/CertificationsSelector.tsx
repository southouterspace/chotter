import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus, Award } from 'lucide-react'

export interface Certification {
  name: string
  issueDate: string
  expiryDate?: string
  certificationNumber?: string
}

interface CertificationsSelectorProps {
  value: Certification[]
  onChange: (certifications: Certification[]) => void
  disabled?: boolean
}

export function CertificationsSelector({ value, onChange, disabled }: CertificationsSelectorProps) {
  const handleAdd = () => {
    onChange([
      ...value,
      {
        name: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        certificationNumber: '',
      },
    ])
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleUpdate = (index: number, field: keyof Certification, fieldValue: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: fieldValue }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Certifications ({value.length})
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {/* Certifications List */}
      {value.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-2 text-sm text-muted-foreground">
              No certifications added yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click "Add Certification" to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {value.map((cert, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Header with remove button */}
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="gap-1">
                      <Award className="h-3 w-3" />
                      Certification {index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Certification Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`cert-name-${index}`}>
                      Certification Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`cert-name-${index}`}
                      placeholder="e.g., HVAC Certified, EPA 608, NATE Certified"
                      value={cert.name}
                      onChange={e => handleUpdate(index, 'name', e.target.value)}
                      disabled={disabled}
                    />
                  </div>

                  {/* Issue Date and Expiry Date */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`cert-issue-${index}`}>
                        Issue Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`cert-issue-${index}`}
                        type="date"
                        value={cert.issueDate}
                        onChange={e => handleUpdate(index, 'issueDate', e.target.value)}
                        disabled={disabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`cert-expiry-${index}`}>
                        Expiry Date (optional)
                      </Label>
                      <Input
                        id={`cert-expiry-${index}`}
                        type="date"
                        value={cert.expiryDate || ''}
                        onChange={e => handleUpdate(index, 'expiryDate', e.target.value)}
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  {/* Certification Number */}
                  <div className="space-y-2">
                    <Label htmlFor={`cert-number-${index}`}>
                      Certification Number (optional)
                    </Label>
                    <Input
                      id={`cert-number-${index}`}
                      placeholder="e.g., ABC-12345"
                      value={cert.certificationNumber || ''}
                      onChange={e => handleUpdate(index, 'certificationNumber', e.target.value)}
                      disabled={disabled}
                    />
                  </div>

                  {/* Expiry Warning */}
                  {cert.expiryDate && new Date(cert.expiryDate) < new Date() && (
                    <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                      This certification has expired
                    </div>
                  )}
                  {cert.expiryDate &&
                    new Date(cert.expiryDate) > new Date() &&
                    new Date(cert.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 && (
                    <div className="rounded-md bg-yellow-500/10 p-2 text-xs text-yellow-700">
                      This certification expires soon
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
