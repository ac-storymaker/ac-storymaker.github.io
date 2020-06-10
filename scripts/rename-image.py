import cv2 
import os

#dirPath = '../frameChoice/active/closing/'
dirPath = '../frameChoice/active/thinking/'

fileList = os.listdir(dirPath)
fileList = sorted(fileList,key=lambda x:int(x.partition('.')[0]))

for i,fileName in enumerate(fileList):
    print(i,'/',len(fileList))
    img = cv2.imread(dirPath + fileName)
    cv2.imwrite(dirPath+str(i)+'.png',img)
