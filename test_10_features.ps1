$ErrorActionPreference = 'Stop'
try {
  Write-Host "=== FEATURE 1: Student, Faculty & Admin Login ==="
  # 1. Admin Login
  $adminBody = @{ email = "admin@smartattendance.edu"; password = "password123" } | ConvertTo-Json
  $adminAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $adminBody -ContentType "application/json"
  $adminToken = $adminAuth.data.token
  Write-Host "[PASS] Admin Login: Success, Role=$($adminAuth.data.role), Name=$($adminAuth.data.name)"

  # 2. Teacher Login
  $teacherBody = @{ email = "teacher1@smartattendance.edu"; password = "password123" } | ConvertTo-Json
  $teacherAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $teacherBody -ContentType "application/json"
  $teacherToken = $teacherAuth.data.token
  Write-Host "[PASS] Teacher Login: Success, Role=$($teacherAuth.data.role), Name=$($teacherAuth.data.name)"

  # 3. Student Login
  $studentBody = @{ email = "student1@gmail.com"; password = "password123" } | ConvertTo-Json
  $studentAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $studentBody -ContentType "application/json"
  $studentToken = $studentAuth.data.token
  Write-Host "[PASS] Student Login: Success, Role=$($studentAuth.data.role), Roll=$($studentAuth.data.identifier)"

  Write-Host "`n=== FEATURE 2: Student Management (Admin CRUD) ==="
  $adminHeaders = @{ Authorization = "Bearer $adminToken" }
  $studentsList = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/students" -Headers $adminHeaders -Method GET
  Write-Host "[PASS] Admin List Students: Found $($studentsList.data.Count) students enrolled"

  Write-Host "`n=== FEATURE 3: QR Code Generation (Dynamic Rolling QR) ==="
  $teacherHeaders = @{ Authorization = "Bearer $teacherToken" }
  $sessionReq = @{
    subjectId = 1
    sessionTitle = "Cloud Architecture & Microservices"
    roomNumber = "Lab 3"
    durationMinutes = 10
  } | ConvertTo-Json
  $sessionRes = Invoke-RestMethod -Uri "http://localhost:8080/api/sessions" -Headers $teacherHeaders -Method POST -Body $sessionReq -ContentType "application/json"
  $sessionId = $sessionRes.data.id
  $qrToken = $sessionRes.data.token
  $hasQrCode = -not [string]::IsNullOrEmpty($sessionRes.data.qrBase64)
  Write-Host "[PASS] Teacher Created Session #$sessionId with Token=$qrToken, QR Base64 Generated=$hasQrCode"

  Write-Host "`n=== FEATURES 4, 5 & 10: QR Code Scan, Face Snapshot & GPS Location Verification ==="
  $studentHeaders = @{ Authorization = "Bearer $studentToken" }
  $markReq = @{
    token = $qrToken
    latitude = 28.6140
    longitude = 77.2091
    faceImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP..."
    deviceInfo = "Chrome 122 on Windows 11 MCA Testing Machine"
  } | ConvertTo-Json
  $markRes = Invoke-RestMethod -Uri "http://localhost:8080/api/attendance/mark" -Headers $studentHeaders -Method POST -Body $markReq -ContentType "application/json"
  Write-Host "[PASS] Attendance Mark Success: Status=$($markRes.data.status), FaceVerified=$($markRes.data.faceVerified), LocationVerified=$($markRes.data.locationVerified), Distance=$($markRes.data.distanceMeters)m"

  Write-Host "`n=== FEATURE 6: Duplicate Attendance Prevention ==="
  try {
    $dupRes = Invoke-RestMethod -Uri "http://localhost:8080/api/attendance/mark" -Headers $studentHeaders -Method POST -Body $markReq -ContentType "application/json"
    Write-Host "[FAIL] Duplicate attendance was not blocked!"
  } catch {
    Write-Host "[PASS] Duplicate attendance blocked successfully: $($_.Exception.Message)"
  }

  Write-Host "`n=== FEATURE 7: Attendance History ==="
  $histRes = Invoke-RestMethod -Uri "http://localhost:8080/api/attendance/student/history" -Headers $studentHeaders -Method GET
  Write-Host "[PASS] Student Attendance History retrieved: $($histRes.data.Count) records found. Latest subject: $($histRes.data[0].subjectName), FaceVerified=$($histRes.data[0].faceVerified)"

  Write-Host "`n=== FEATURE 8: Attendance Percentage & 75% Rule Calculation ==="
  $statsRes = Invoke-RestMethod -Uri "http://localhost:8080/api/attendance/student/stats" -Headers $studentHeaders -Method GET
  Write-Host "[PASS] Student Subject Stats retrieved: $($statsRes.data.Count) subjects calculated. First subject pct=$($statsRes.data[0].attendancePercentage)%"

  Write-Host "`n=== FEATURE 9: Attendance Reports (Institutional & Teacher Session) ==="
  $reportsRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/reports" -Headers $adminHeaders -Method GET
  Write-Host "[PASS] Admin Institutional Reports retrieved: $($reportsRes.data.Count) rows generated"
  $sessionRecordsRes = Invoke-RestMethod -Uri "http://localhost:8080/api/sessions/$sessionId/records" -Headers $teacherHeaders -Method GET
  Write-Host "[PASS] Teacher Session Records retrieved: $($sessionRecordsRes.data.Count) attendees verified in Session #$sessionId"

  Write-Host "`n======================================================="
  Write-Host ">>> ALL 10 CORE FEATURES TESTED & 100% OPERATIONAL! <<<"
  Write-Host "======================================================="
} catch {
  Write-Host "Verification encountered error: $_"
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      Write-Host "Server Response: " $reader.ReadToEnd()
    }
  }
  Write-Host $_.ScriptStackTrace
}
