#!/bin/bash

# generate_random_string.sh - Generate random strings with various options

# Default values
LENGTH=10
COUNT=1
CHARSET="alphanumeric"
SHOW_HELP=false

# Function to display help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Generate random strings with various options"
    echo ""
    echo "OPTIONS:"
    echo "  -l, --length LENGTH    Length of the random string (default: 10)"
    echo "  -c, --count COUNT      Number of random strings to generate (default: 1)"
    echo "  -t, --type TYPE        Character set type:"
    echo "                           alphanumeric (default) - letters and numbers"
    echo "                           alpha - letters only"
    echo "                           numeric - numbers only"
    echo "                           lower - lowercase letters only"
    echo "                           upper - uppercase letters only"
    echo "                           hex - hexadecimal characters"
    echo "                           special - alphanumeric + special characters"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Generate one 10-character alphanumeric string"
    echo "  $0 -l 20               # Generate one 20-character alphanumeric string"
    echo "  $0 -c 5                # Generate 5 random strings"
    echo "  $0 -t alpha -l 15      # Generate 15-character alphabetic string"
    echo "  $0 -t hex -l 8 -c 3    # Generate 3 hexadecimal strings of 8 characters"
}

# Function to generate random string
generate_random_string() {
    local length=$1
    local charset=$2
    
    case $charset in
        "alphanumeric")
            chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            ;;
        "alpha")
            chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
            ;;
        "numeric")
            chars="0123456789"
            ;;
        "lower")
            chars="abcdefghijklmnopqrstuvwxyz"
            ;;
        "upper")
            chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            ;;
        "hex")
            chars="0123456789abcdef"
            ;;
        "special")
            chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
            ;;
        *)
            echo "Error: Invalid charset type '$charset'"
            exit 1
            ;;
    esac
    
    # Generate random string
    result=""
    for ((i=0; i<length; i++)); do
        result="${result}${chars:$((RANDOM % ${#chars})):1}"
    done
    
    echo "$result"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--length)
            LENGTH="$2"
            shift 2
            ;;
        -c|--count)
            COUNT="$2"
            shift 2
            ;;
        -t|--type)
            CHARSET="$2"
            shift 2
            ;;
        -h|--help)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "Error: Unknown option '$1'"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Show help if requested
if $SHOW_HELP; then
    show_help
    exit 0
fi

# Validate arguments
if ! [[ "$LENGTH" =~ ^[0-9]+$ ]] || [ "$LENGTH" -lt 1 ]; then
    echo "Error: Length must be a positive integer"
    exit 1
fi

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive integer"
    exit 1
fi

# Generate random strings
for ((i=1; i<=COUNT; i++)); do
    random_string=$(generate_random_string "$LENGTH" "$CHARSET")
    if [ "$COUNT" -gt 1 ]; then
        echo "$i: $random_string"
    else
        echo "$random_string"
    fi
done 