import numpy as np
import cv2
import os
import time

outDir = "../frame-extract-result/4/"
vidPath = "../videos/4.mp4"



cmdStr = "mkdir " + outDir
os.system(cmdStr)

outDir += "/"

cap = cv2.VideoCapture(vidPath)
print("Loaded " + vidPath)

i = 0
while(True):
    print('Frame ', i)
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    if frame is None:
        break

    # Display the resulting frame
    saveStr = outDir + str(i) + '.png'
    cv2.imwrite(saveStr,frame)
    i += 1

# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()



