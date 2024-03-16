import { getContractByUser } from '~/server/utils/gateway'

export default defineEventHandler(async (event) => {
  const {
    id,
    name,
    school,
    major,
  } = await readBody<{ id: string, name: string, school: string, major: string }>(event)
  const { contract } = await getContractByUser(event)

  const preResp = await contract.evaluateTransaction('CreateStudent', JSON.stringify({
    ID: id,
    Name: name,
    AdmissionYear: 2024,
    Major: major,
  }))
  if (preResp.length !== 0)
    return createError(Buffer.from(preResp).toString('utf-8'))

  const resp = await contract.submitTransaction('CreateStudent', JSON.stringify({
    ID: id,
    Name: name,
    School: school,
    AdmissionYear: 2024,
    Major: major,
  }))

  console.info('create student response', resp)

  return resp.length ? resp : { succeed: true }
})
