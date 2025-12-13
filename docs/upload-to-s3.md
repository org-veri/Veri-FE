# S3 업로드 가이드

## AWS CLI 설치
1. https://aws.amazon.com/cli/ 에서 AWS CLI 다운로드 및 설치
2. 설치 후 PowerShell에서 확인:
   ```powershell
   aws --version
   ```

## AWS 인증 설정
```powershell
aws configure
```
- AWS Access Key ID 입력
- AWS Secret Access Key 입력
- Default region name: `ap-northeast-2` (서울 리전)
- Default output format: `json`

## 파일 업로드 명령어
```powershell
aws s3 cp src\assets\images\union.png s3://3-veri-s3-bucket/assets/union.png
```

## 업로드 확인
브라우저에서 다음 URL로 접속하여 확인:
```
https://3-veri-s3-bucket.s3.ap-northeast-2.amazonaws.com/assets/union.png
```

## 참고사항
- 파일이 공개적으로 접근 가능하도록 버킷 정책이 설정되어 있어야 합니다
- CORS 설정도 필요할 수 있습니다

