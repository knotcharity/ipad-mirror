with open('ios/ipadapp.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

content = content.replace('SWIFT_VERSION = "";', 'SWIFT_VERSION = 5.0;')

with open('ios/ipadapp.xcodeproj/project.pbxproj', 'w') as f:
    f.write(content)

print('Swift version patched!')