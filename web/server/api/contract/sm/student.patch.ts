import { getContractByUser } from '~/server/utils/gateway'

export default defineEventHandler(async (event) => {
  const {
    id,
    name,
    admissionYear,
    graduated,
    major,
  } = await readBody<{ id: string, name: string, major: string, admissionYear: number, graduated: boolean }>(event)
  const { contract } = await getContractByUser(event)

  const preResp = await contract.evaluateTransaction('UpdateStudent', id, JSON.stringify({
    Name: name,
    AdmissionYear: admissionYear,
    Graduated: graduated,
    Major: major,
  }))
  console.info('update student:', id, name, admissionYear, graduated, major)
  if (preResp.length !== 0)
    return createError(Buffer.from(preResp).toString('utf-8'))

  const resp = await contract.submitTransaction('UpdateStudent', id, JSON.stringify({
    Name: name,
    AdmissionYear: admissionYear,
    Graduated: graduated,
    Major: major,
  }))

  console.info('create student response', resp)

  return resp.length ? resp : { succeed: true }
})
