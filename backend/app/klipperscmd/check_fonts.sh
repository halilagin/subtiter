#!/bin/bash
# Script to check if required fonts are installed in the Docker image

echo "=== Checking for DejaVu Sans ==="
ls -la /usr/share/fonts/truetype/dejavu/DejaVuSans* 2>/dev/null || echo "DejaVu Sans not found"

echo ""
echo "=== Checking for Liberation Sans ==="
ls -la /usr/share/fonts/truetype/liberation/LiberationSans* 2>/dev/null || echo "Liberation Sans not found"

echo ""
echo "=== Checking for Arial (MS Core Fonts) ==="
ls -la /usr/share/fonts/truetype/msttcorefonts/Arial* 2>/dev/null || echo "Arial not found"

echo ""
echo "=== All installed fonts containing DejaVu, Liberation, or Arial ==="
fc-list | grep -iE '(dejavu sans|liberation sans|arial)' | sort

echo ""
echo "=== Font directories ==="
find /usr/share/fonts -name "*.ttf" -o -name "*.ttc" | grep -iE '(dejavu|liberation|arial)' | sort

