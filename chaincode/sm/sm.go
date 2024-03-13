package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Student struct {
	ID            string `json:"id"`            // 身份证
	Name          string `json:"name"`          // 姓名
	AdmissionYear int    `json:"admissionYear"` // 入学年份
	Major         string `json:"major"`         // 专业
	School        string `json:"school"`        // 学校 School1MSP or School2MSP
	Graduated     bool   `json:"graduated"`     // 是否已毕业
	CreationDate  string `json:"creationDate"`  // 创建日期
}

type StudentGrade struct {
	ID               string `json:"id"`               // 学生身份证+School  123321-School1
	ModificationDate string `json:"modificationDate"` // 修改日期
	YearStatus       string `json:"yearStatus"`       // 学年度 freshman | sophomore | junior | senior
	Semester         int    `json:"semester"`         // 上下季，例如“ 0 = 上学期”，“ 1 = 下学期”
	CourseGrades     string `json:"courseGrades"`     // 科目成绩，作为JSON字符串存储
}

// StudentExists returns true if a student exists with given ID
func (s *SmartContract) StudentExists(ctx contractapi.TransactionContextInterface, studentID string) (bool, error) {
	studentAsBytes, err := ctx.GetStub().GetState(studentID)
	if err != nil {
		return false, err
	}
	return studentAsBytes != nil, nil
}

func (s *SmartContract) AssertAdminOrTeacher(ctx contractapi.TransactionContextInterface) (string, error) {
	clientId := ctx.GetClientIdentity()
	affiliation, found, err := clientId.GetAttributeValue("hf.Affiliation")
	if !found {
		return "", fmt.Errorf("user affiliation not found")
	}
	if err != nil {
		return "", fmt.Errorf("%v", err)
	}
	mspId, err := clientId.GetMSPID()
	if err != nil {
		return "", fmt.Errorf("%v", err)
	}
	switch mspId {
	case "EducationBureauMSP":
		// 教育局的人可以访问所有数据
		// if affiliation != "bureau.admin" {
		// 	return fmt.Errorf("unauthorized access, only bureau.admin can access")
		// }
	case "School1MSP":
		// School1的人，需要管理员或是老师
		if affiliation != "school1.admin" && affiliation != "school1.teacher" {
			return mspId, fmt.Errorf("unauthorized access, only school1.admin or school1.teacher can access or assets owner")
		}
	case "School2MSP":
		// School2的人，需要管理员或是老师
		if affiliation != "school2.admin" && affiliation != "school2.teacher" {
			return mspId, fmt.Errorf("unauthorized access, only school2.admin or school2.teacher can access or assets owner")
		}
	default:
		return mspId, fmt.Errorf("unauthorized access, unknown MSP ID")
	}
	return mspId, nil
}

// 管理员，老师，或是 studentSchool == clientId.GetMSPID() && studentID == clientId.id
func (s *SmartContract) AssertOwner(ctx contractapi.TransactionContextInterface, studentID string) (string, error) {
	clientId := ctx.GetClientIdentity()
	id, err := clientId.GetID()
	if err != nil {
		return "", fmt.Errorf("%v", err)
	}
	msp, err := s.AssertAdminOrTeacher(ctx)
	if err != nil {
		if studentID == id {
			return msp, nil
		}
		return msp, err
	}
	return msp, nil
}

func (s *SmartContract) AssertJurisdiction(ctx contractapi.TransactionContextInterface, school string) (string, error) {
	clientId := ctx.GetClientIdentity()
	_, err := clientId.GetID()
	if err != nil {
		return "", fmt.Errorf("%v", err)
	}
	msp, err := s.AssertAdminOrTeacher(ctx)
	if err != nil {
		return "", fmt.Errorf("%v", err)
	}
	if msp == "EducationBureauMSP" {
		return msp, nil
	}
	if msp != school {
		return msp, fmt.Errorf("%s No jurisdiction school %s", msp, school)
	}
	return msp, nil
}

func (s *SmartContract) CreateStudent(ctx contractapi.TransactionContextInterface, studentJSON string) error {
	// 自己不能新增，只有管理员和老师可以 并且创建的学校School一定在管辖范围
	_, err := s.AssertAdminOrTeacher(ctx)
	if err != nil {
		return err
	}

	var student Student
	err = json.Unmarshal([]byte(studentJSON), &student)
	if err != nil {
		return fmt.Errorf("%v", err)
	}
	_, err = s.AssertJurisdiction(ctx, student.School)
	if err != nil {
		return err
	}

	exists, err := s.StudentExists(ctx, student.ID)
	if err != nil {
		return err
	} else if exists {
		return fmt.Errorf("The student %s already exists", student.ID)
	}
	studentAsBytes, _ := json.Marshal(student)
	return ctx.GetStub().PutState(student.ID, studentAsBytes)
}

func (s *SmartContract) CreateStudentGrade(ctx contractapi.TransactionContextInterface, studentId string, gradeJSON string) error {
	// 自己不能新增，只有管理员和老师可以，并且学校School一定在管辖范围
	_, err := s.AssertAdminOrTeacher(ctx)
	if err != nil {
		return err
	}

	student, err := s.QueryStudentById(ctx, studentId)
	if err != nil {
		return err
	}

	_, err = s.AssertJurisdiction(ctx, student.School)
	if err != nil {
		return err
	}

	var grade StudentGrade
	err = json.Unmarshal([]byte(gradeJSON), &grade)
	if err != nil {
		return err
	}

	grade.ID = studentId + "-" + student.School

	gradeAsBytes, _ := json.Marshal(grade)
	return ctx.GetStub().PutState(grade.ID, gradeAsBytes)
}

func (s *SmartContract) QueryStudentById(ctx contractapi.TransactionContextInterface, studentID string) (*Student, error) {
	// 管理员，老师，和自己都可以
	_, err := s.AssertOwner(ctx, studentID)
	if err != nil {
		return nil, err
	}

	studentAsBytes, err := ctx.GetStub().GetState(studentID)
	if err != nil {
		return nil, err
	} else if studentAsBytes == nil {
		return nil, fmt.Errorf("the student %s does not exist", studentID)
	}

	var student Student
	err = json.Unmarshal(studentAsBytes, &student)
	if err != nil {
		return nil, err
	}
	_, err = s.AssertJurisdiction(ctx, student.School)
	if err != nil {
		return nil, err
	}

	return &student, nil
}

// QueryStudentGrades returns all grades for a student with the given ID
func (s *SmartContract) QueryStudentGrades(ctx contractapi.TransactionContextInterface, studentID string) ([]StudentGrade, error) {
	// 管理员，老师，和自己都可以
	_, err := s.AssertOwner(ctx, studentID)
	if err != nil {
		return nil, err
	}

	student, err := s.QueryStudentById(ctx, studentID)
	if err != nil {
		return nil, err
	}
	_, err = s.AssertJurisdiction(ctx, student.School)
	if err != nil {
		return nil, err
	}

	// Create a query string to query grades based on the student ID
	queryString := fmt.Sprintf(`{"selector":{"id":"%s"}}`, studentID)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var grades []StudentGrade
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var grade StudentGrade
		err = json.Unmarshal(queryResponse.Value, &grade)
		if err != nil {
			return nil, err
		}
		grades = append(grades, grade)
	}

	return grades, nil
}

func (s *SmartContract) GetStudents(ctx contractapi.TransactionContextInterface) ([]*Student, error) {
	// TODO: bureau可以
	iterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer iterator.Close()

	var students []*Student
	for iterator.HasNext() {
		resp, err := iterator.Next()
		if err != nil {
			return nil, err
		}

		var student Student
		err = json.Unmarshal(resp.Value, &student)
		if err != nil {
			return nil, err
		}
		students = append(students, &student)
	}

	return students, nil
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("Init Ledger Successfully!")
	return nil
}

func main() {
	assetChaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating student manager chaincode: %v", err)
	}

	if err := assetChaincode.Start(); err != nil {
		log.Panicf("Error starting student manager chaincode: %v", err)
	}
}
