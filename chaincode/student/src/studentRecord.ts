import { Buffer } from 'node:buffer'
import type { Context } from 'fabric-contract-api'
import { Contract } from 'fabric-contract-api'

interface StudentRecord {
  studentId: string
  name: string
  birthDate: string
  enrollmentStatus: string
  currentSchool: string
  previousSchools: string[]
}

export class StudentRecordContract extends Contract {
  async initLedger(_ctx: Context): Promise<void> {
    console.info('Initialized Ledger')
  }

  async createStudentRecord(ctx: Context, studentId: string, name: string, birthDate: string): Promise<void> {
    const studentRecord: StudentRecord = {
      studentId,
      name,
      birthDate,
      enrollmentStatus: 'enrolled',
      currentSchool: ctx.clientIdentity.getID(),
      previousSchools: [],
    }

    await ctx.stub.putState(studentId, Buffer.from(JSON.stringify(studentRecord)))
  }

  async queryStudentRecord(ctx: Context, studentId: string): Promise<string> {
    const studentRecordBytes = await ctx.stub.getState(studentId)
    if (!studentRecordBytes || studentRecordBytes.length === 0)
      throw new Error(`Student ${studentId} does not exist`)

    return studentRecordBytes.toString()
  }

  async updateStudentRecord(ctx: Context, studentId: string, newSchool: string): Promise<void> {
    const studentRecordBytes = await ctx.stub.getState(studentId)
    if (!studentRecordBytes || studentRecordBytes.length === 0)
      throw new Error(`Student ${studentId} does not exist`)

    const studentRecord: StudentRecord = JSON.parse(studentRecordBytes.toString())
    studentRecord.previousSchools.push(studentRecord.currentSchool)
    studentRecord.currentSchool = newSchool

    await ctx.stub.putState(studentId, Buffer.from(JSON.stringify(studentRecord)))
  }
}

export default StudentRecordContract
