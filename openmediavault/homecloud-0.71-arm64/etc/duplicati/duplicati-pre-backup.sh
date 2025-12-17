#!/bin/sh

stop_container() {
    local app_name="$1"
    response=$(curl -s --insecure -X POST "https://172.17.0.1:5000/stopcontainer?name=$app_name")
    
    if echo "$response" | grep -q '"success":true'; then
        return 0
    else
        return 1
    fi
}

# Main execution
if [ $# -eq 0 ]; then
    echo "Usage: $0 <app_name>"
    exit 1
fi

stop_container "$1"
exit $?