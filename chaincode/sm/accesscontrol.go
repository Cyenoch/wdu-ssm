package main

import (
	"fmt"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func GetMSPID(ctx contractapi.TransactionContextInterface) string {
	clientID := ctx.GetClientIdentity()
	mspID, _ := clientID.GetMSPID()
	return mspID
}

// AssertAdmin Check if user is admin
func AssertAdmin(ctx contractapi.TransactionContextInterface, allowedMspIDs ...string) error {
	return CheckAffiliation(ctx,
		"bureau.admin",
		"school1.admin",
		"school2.admin",
	)
}

// CheckMspID 检查用户是否属于指定的MSP。
func CheckMspID(ctx contractapi.TransactionContextInterface, allowedMspIDs ...string) error {
	mspID := GetMSPID(ctx)

	for _, allowedMspID := range allowedMspIDs {
		if mspID == allowedMspID {
			return nil
		}
	}

	return fmt.Errorf("unauthorized access, MSP ID %s not allowed", mspID)
}

// CheckAffiliation 检查用户是否具有访问特定资源的权限
func CheckAffiliation(ctx contractapi.TransactionContextInterface, requiredAffiliations ...string) error {
	clientID := ctx.GetClientIdentity()

	// 获取hf.Affiliation属性
	affiliation, found, err := clientID.GetAttributeValue("hf.Affiliation")
	if err != nil {
		return fmt.Errorf("failed to get hf.Affiliation attribute: %v", err)
	}
	if !found {
		return fmt.Errorf("hf.Affiliation attribute not found")
	}

	// 解析用户的隶属关系
	userAffiliations := strings.Split(affiliation, ".")

	// 检查用户隶属关系是否满足任一所需隶属关系
	for _, requiredAffiliation := range requiredAffiliations {
		requiredParts := strings.Split(requiredAffiliation, ".")
		if isSubset(userAffiliations, requiredParts) {
			return nil // 用户隶属关系满足要求
		}
	}

	// 如果没有任何一个所需隶属关系被满足
	return fmt.Errorf("user does not have required affiliation")
}

// isSubset 检查第一个切片是否是第二个切片的子集
func isSubset(userAffiliations, requiredParts []string) bool {
	if len(userAffiliations) < len(requiredParts) {
		return false
	}
	for i, part := range requiredParts {
		if userAffiliations[i] != part {
			return false
		}
	}
	return true
}

/**

allowedMspAndAffiliations := map[string][]string{
	"EducationBureauMSP": {"bureau.admin"},
	"School1MSP":         {"school1.admin", "school1.teacher"},
	"School2MSP":         {"school2.admin", "school2.teacher"},
}

**/
