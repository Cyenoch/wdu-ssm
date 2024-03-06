import FabricCAServices from "fabric-ca-client";
import { Wallet, Wallets } from "fabric-network";
import path from 'path'
import fs from 'fs'

import ConnectionInfo from './assets/connection-info.json'

const mspId = "EducationBureauMSP"
const adminUserId = "admin"
const adminUserPwd = "adminpw"
const __dirname = new URL('.', import.meta.url).pathname;

const buildCAClient = (caHostName: "ca.bureau.edu.cn"): FabricCAServices => {
  const caInfo = ConnectionInfo.certificateAuthorities[caHostName]
  const caCertFile = path.resolve("../../../", caInfo.pem);
  const caClient = new FabricCAServices(caInfo.url, {
    trustedRoots: fs.readFileSync(caCertFile),
    verify: true,
  }, caInfo.caName)
  return caClient
}

const channelName = "two-edu-channel"
const cc = "sm"
const school1UserId = "wtf"

async function main() {

  const caClient = buildCAClient('ca.bureau.edu.cn')
  const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'))

  {
    const identity = await wallet.get(adminUserId)
    if (!identity) {
      const enrollment = await caClient.enroll({
        enrollmentID: adminUserId,
        enrollmentSecret: adminUserPwd,
      })
      const x509 = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes()
        },
        mspId,
        type: 'X.509'
      }
      await wallet.put(adminUserId, x509)
      console.log('Successfully enrolled admin user and imported it into the wallet');
    }
  }

  const adminIdentity = await wallet.get(adminUserId)
  if (!adminIdentity) throw new Error('admin user does not exist in the wallet')
  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
  const adminUser =  await provider.getUserContext(adminIdentity, adminUserId) 

  {
    const newUser = {
      id: 'bureauAdmin001',
      secret: 'pwd',
      affiliation: 'bureau.admin'
    }
    const identity = await wallet.get(newUser.id)
    if (identity) {
      console.warn('user exists.', identity)
      return 
    }
    const secret = await caClient.register({
      affiliation: newUser.affiliation,
      enrollmentID: newUser.id,
      enrollmentSecret: newUser.secret,
      role: 'client'
    }, adminUser)
    const enrollment = await caClient.enroll({
      enrollmentID: newUser.id,
      enrollmentSecret: newUser.secret
    })
    const x509 = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId,
      type: 'X.509'
    }
    await wallet.put(newUser.id, x509)
    console.info('successfully registered')
    console.table(newUser)
  }
}

await main()
