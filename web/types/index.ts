export type AvailableCA = 'ca-bureau' | 'ca-school1' | 'ca-school2'
export interface UserIdentity {
  caname: string
  identities: {
    affiliation: string
    attrs: { name: string, value: string }[]
    id: string
    max_enrollments: number
    type: string
  }[]
}
