import { Context, Contract, Info, Object, Param, Property, Returns, Transaction } from 'fabric-contract-api';

@Object()
export class StudentRecord {
  @Property('ID', 'string')
  readonly ID: string

  @Property('name', 'string')
  readonly name: string

  @Property('age', 'number')
  readonly age: number

  @Property('grade', 'string')
  readonly grade: string

  @Property('school', 'string')
  readonly school: string

  constructor(
    { ID, name, age, grade, school }: {
      ID: string,
      name: string,
      age: number,
      grade: string,
      school: string
    }
  ) {
    this.ID = ID
    this.name = name
    this.age = age
    this.grade = grade
    this.school = school
  }

  static fromJSON(json: string | Uint8Array) {
    const obj = typeof json === 'string' ? json : JSON.parse(new TextDecoder().decode(json))
    if (!obj || typeof obj !== 'object') throw new Error('Invalid JSON: ' + json)
    return new StudentRecord(obj)
  }
}

@Info({ title: 'StudentManager', description: 'Smart contract for student management' })
export class StudentRecordContract extends Contract {
  async initLedger(ctx: Context) {
    console.log('Chaincode initialization');
    // await this.createStudentRecord(
    //   ctx,
    //   new StudentRecord(
    //     {
    //       ID: "2022020121132",
    //       name: "wenqiangLiu",
    //       age: 23,
    //       grade: "2022",
    //       school: "Edu1"
    //     }
    //   )
    // )
  }

  @Transaction()
  @Param('studentObj', 'StudentRecord', 'Student record')
  async createStudentRecord(ctx: Context, student: StudentRecord) {
    await ctx.stub.putState(student.ID, Buffer.from(JSON.stringify(student)));
    return JSON.stringify(student);
  }

  @Transaction(false)
  @Returns('StudentRecord')
  async queryStudentRecord(ctx: Context, studentId: string): Promise<StudentRecord> {
    const recordBytes = await ctx.stub.getState(studentId);
    if (!recordBytes || recordBytes.length === 0) {
      throw new Error(`The student record ${studentId} does not exist.`);
    }
    return StudentRecord.fromJSON(recordBytes);
  }

  @Transaction()
  @Param('studentObj', 'StudentRecord', 'Student record')
  async updateStudentRecord(ctx: Context, student: Partial<StudentRecord>): Promise<StudentRecord> {
    if (!student.ID) throw new Error('The student ID cannot be null')
    const exists = await this.queryStudentRecord(ctx, student.ID);
    if (!exists) {
      throw new Error(`The student record ${student.ID} does not exist.`)
    }

    const updatedRecord = new StudentRecord({
      ...exists,
      ...student
    });

    await ctx.stub.putState(student.ID, Buffer.from(JSON.stringify(updatedRecord)));
    return updatedRecord
  }

  // TODO: Transfer to another school

  async #readStudent(ctx: Context, id: string): Promise<StudentRecord> {
    const bytes = await ctx.stub.getState(id)
    if (!bytes || bytes.length === 0) throw new Error(`Sorry, student record ${id} does not exist.`)
    return StudentRecord.fromJSON(bytes)
  }
}

// https://github.com/hyperledger/fabric-samples/blob/main/full-stack-asset-transfer-guide/contracts/asset-transfer-typescript/src/assetTransfer.ts
