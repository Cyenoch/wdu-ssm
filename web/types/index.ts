import type peers from '~/config/peers'

export type AvailableMSP = 'EducationBureauMSP' | 'School1MSP' | 'School2MSP'

export type AvailableCA = 'ca-bureau' | 'ca-school1' | 'ca-school2'

export interface ClientIdentity {
  affiliation: string
  attrs: { name: string, value: string }[]
  id: string
  max_enrollments: number
  type: string
}

export interface CAIdentity {
  caname: string
  identities: ClientIdentity[]
}

export type Peer = typeof peers[number]
