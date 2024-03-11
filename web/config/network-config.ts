import fs from 'node:fs'
import type Buffer from 'node:buffer'
import path from 'node:path'

export type Orgs = ('school1' | 'school2' | 'bureau')

export interface ICAConfig {
  pem: Buffer
  url: string
  name: string
  user: string
  passwd: string
}
export interface IPeerConfig {
  endpoint: string
  crt: Buffer
}
export interface IUserConfig {
  keystore: Buffer
  signcerts: Buffer
}
export interface IOrgConfig {
  name: string
  domain: string
  msp: string
  users: {
    user1: IUserConfig
  }
  peer: IPeerConfig
  ca: ICAConfig
}
export interface IOrdererConfig {
  url: string
}
export interface IContract {
  name: string
  channel: string
}
export interface IContracts {
  sm: IContract
}
export interface INetworkConfig<T extends string> {
  orderer: IOrdererConfig
  orgs: Record<T, IOrgConfig>
  contracts: IContracts
}

export const NetworkConfig: INetworkConfig<Orgs> = {
  orderer: {
    url: 'orderer0.edu.cn',
  },
  contracts: {
    sm: {
      name: 'sm',
      channel: 'two-edu-channel',
    },
  },
  orgs: {
    school1: {
      name: '学校 1',
      domain: 'school1.edu.cn',
      msp: 'School1MSP',
      peer: {
        endpoint: 'peer0.school1.edu.cn:7061',
        crt: fs.readFileSync('../peer/school1.edu.cn/peers/peer0.school1.edu.cn/tls/ca.crt'),
      },
      users: {
        user1: {
          keystore: readFirstDirFile('../peer/school1.edu.cn/users/User1@school1.edu.cn/msp/keystore'),
          signcerts: readFirstDirFile('../peer/school1.edu.cn/users/User1@school1.edu.cn/msp/signcerts'),
        },
      },
      ca: {
        pem: fs.readFileSync('../peer/school1.edu.cn/ca/ca-cert.pem'),
        url: 'https://ca.school1.edu.cn:7064',
        name: 'ca-school1',
        user: 'admin',
        passwd: 'adminpw',
      },
    },
    school2: {
      name: '学校 2',
      domain: 'school2.edu.cn',
      msp: 'School2MSP',
      peer: {
        endpoint: 'peer0.school2.edu.cn:7071',
        crt: fs.readFileSync('../peer/school2.edu.cn/peers/peer0.school2.edu.cn/tls/ca.crt'),
      },
      users: {
        user1: {
          keystore: readFirstDirFile('../peer/school2.edu.cn/users/User1@school2.edu.cn/msp/keystore'),
          signcerts: readFirstDirFile('../peer/school2.edu.cn/users/User1@school2.edu.cn/msp/signcerts'),
        },
      },
      ca: {
        pem: fs.readFileSync('../peer/school2.edu.cn/ca/ca-cert.pem'),
        url: 'https://ca.school2.edu.cn:7074',
        name: 'ca-school2',
        user: 'admin',
        passwd: 'adminpw',
      },
    },
    bureau: {
      name: '教育局',
      domain: 'bureau.edu.cn',
      msp: 'EducationBureauMSP',
      peer: {
        endpoint: 'peer0.bureau.edu.cn:7051',
        crt: fs.readFileSync('../peer/bureau.edu.cn/peers/peer0.bureau.edu.cn/tls/ca.crt'),
      },
      users: {
        user1: {
          keystore: readFirstDirFile('../peer/bureau.edu.cn/users/User1@bureau.edu.cn/msp/keystore'),
          signcerts: readFirstDirFile('../peer/bureau.edu.cn/users/User1@bureau.edu.cn/msp/signcerts'),
        },
      },
      ca: {
        pem: fs.readFileSync('../peer/bureau.edu.cn/ca/ca-cert.pem'),
        url: 'https://ca.bureau.edu.cn:7054',
        name: 'ca-educationbureau',
        user: 'admin',
        passwd: 'adminpw',
      },
    },
  },
}

function readFirstDirFile(_path: string): Buffer {
  const files = fs.readdirSync(_path)
  return fs.readFileSync(path.join(_path, files[0]))
}
