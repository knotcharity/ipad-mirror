import re

with open('ios/ipadapp.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

# Find all SWIFT_VERSION lines and print them
lines = [l.strip() for l in content.split('\n') if 'SWIFT_VERSION' in l]
print('Found SWIFT_VERSION lines:', lines)

# Replace any SWIFT_VERSION with empty or missing value
content = re.sub(r'SWIFT_VERSION\s*=\s*"?"?\s*"?;', 'SWIFT_VERSION = 5.0;', content)

with open('ios/ipadapp.xcodeproj/project.pbxproj', 'w') as f:
    f.write(content)

print('Patched!')