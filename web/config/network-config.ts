export type Orgs = ('school1' | 'school2' | 'bureau')

export interface ICAConfig {
  pem: string
  url: string
  name: string
  user: string
  passwd: string
}
export interface IPeerConfig {
  endpoint: string
  crt: string
}
export interface IUserConfig {
  keystore: string
  signcerts: string
}
export interface IOrgConfig {
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
      domain: 'school1.edu.cn',
      msp: 'School1MSP',
      peer: {
        endpoint: 'peer0.school1.edu.cn:7061',
        crt: '../crypto-config/peerOrganizations/school1.edu.cn/peers/peer0.school1.edu.cn/tls/ca.crt',
      },
      users: {
        user1: {
          keystore: '../crypto-config/peerOrganizations/school1.edu.cn/users/User1@school1.edu.cn/msp/keystore',
          signcerts: '../crypto-config/peerOrganizations/school1.edu.cn/users/User1@school1.edu.cn/msp/signcerts',
        },
      },
      ca: {
        pem: '../crypto-config/peerOrganizations/school1.edu.cn/ca/ca-cert.pem',
        url: 'https://ca.school1.edu.cn:7064',
        name: 'ca-school1',
        user: 'admin',
        passwd: 'adminpw',
      },
    },
    school2: {
      domain: 'school2.edu.cn',
      msp: 'School2MSP',
      peer: {
        endpoint: 'peer0.school2.edu.cn:7071',
        crt: '../crypto-config/peerOrganizations/school2.edu.cn/peers/peer0.school2.edu.cn/tls/ca.crt',
      },
      users: {
        user1: {
          keystore: '../crypto-config/peerOrganizations/school2.edu.cn/users/User1@school2.edu.cn/msp/keystore',
          signcerts: '../crypto-config/peerOrganizations/school2.edu.cn/users/User1@school2.edu.cn/msp/signcerts',
        },
      },
      ca: {
        pem: '../crypto-config/peerOrganizations/school2.edu.cn/ca/ca-cert.pem',
        url: 'https://ca.school2.edu.cn:7074',
        name: 'ca-school2',
        user: 'admin',
        passwd: 'adminpw',
      },
    },
    bureau: {
      domain: 'bureau.edu.cn',
      msp: 'EducationBureauMSP',
      peer: {
        endpoint: 'peer0.bureau.edu.cn:7051',
        crt: '../crypto-config/peerOrganizations/bureau.edu.cn/peers/peer0.bureau.edu.cn/tls/ca.crt',
      },
      users: {
        user1: {
          keystore: '../crypto-config/peerOrganizations/bureau.edu.cn/users/User1@bureau.edu.cn/msp/keystore',
          signcerts: '../crypto-config/peerOrganizations/bureau.edu.cn/users/User1@bureau.edu.cn/msp/signcerts',
        },
      },
      ca: {
        pem: '../crypto-config/peerOrganizations/bureau.edu.cn/ca/ca-cert.pem',
        url: 'https://ca.bureau.edu.cn:7054',
        name: 'ca-educationbureau',
        user: 'admin',
        passwd: 'adminpw',
      },
    },
  },
}
