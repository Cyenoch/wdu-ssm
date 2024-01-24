#!/bin/bash

# 定义要添加的主机名和IP地址的文本文件路径
input_file="hosts"

# 读取主机名和IP地址的文本文件
while IFS= read -r line; do
    # 使用空格分隔行中的主机名和IP地址
    read -r ip_address hostname <<< "$line"
    
  if ! grep -qE "^[[:space:]]*$ip_address[[:space:]]+$hostname[[:space:]]*$" /etc/hosts; then
    # If the entry does not exist, add it
    echo "$ip_address $hostname" | sudo tee -a /etc/hosts
    echo "Entry added successfully."
  else
      # If the entry already exists, display a message
      echo "Entry already exists. No changes made."
  fi
done < "$input_file"
