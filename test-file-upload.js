/**
 * Test File Upload System
 * 
 * This script tests the file upload endpoints
 * Run: node test-file-upload.js
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const API_URL = 'http://localhost:5000';
let authToken = '';
let userId = '';

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { status: 0, error: error.message };
  }
}

// Create a test base64 image (1x1 red pixel PNG)
function createTestImage() {
  // 1x1 red pixel PNG in base64
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n🔍 Test 1: Health Check');
  const result = await apiRequest('/health');
  
  if (result.status === 200) {
    console.log('✅ Health check passed');
    console.log('   Response:', result.data);
    return true;
  } else {
    console.log('❌ Health check failed');
    return false;
  }
}

// Test 2: Register User
async function testRegister() {
  console.log('\n🔍 Test 2: Register User');
  
  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phone: '+233201234567',
    role: 'farmer',
    password: 'password123'
  };

  const result = await apiRequest('/api/auth/register', 'POST', userData);
  
  if (result.status === 201) {
    console.log('✅ User registration passed');
    userId = result.data.data.userId;
    authToken = result.data.data.token;
    console.log('   User ID:', userId);
    console.log('   Token:', authToken.substring(0, 20) + '...');
    return true;
  } else {
    console.log('❌ User registration failed');
    console.log('   Error:', result.data);
    return false;
  }
}

// Test 3: Upload File
async function testFileUpload() {
  console.log('\n🔍 Test 3: Upload File');
  
  const fileData = createTestImage();
  const uploadPayload = {
    userId: userId,
    fileName: 'test-image.png',
    fileSize: 150,
    fileType: 'image/png',
    fileData: fileData,
    purpose: 'product',
    metadata: {
      description: 'Test upload'
    }
  };

  const result = await apiRequest('/api/files/upload', 'POST', uploadPayload, authToken);
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ File upload passed');
    console.log('   File ID:', result.data.data.id);
    console.log('   File URL:', result.data.data.fileUrl);
    return result.data.data.id;
  } else {
    console.log('❌ File upload failed');
    console.log('   Error:', result.data);
    return null;
  }
}

// Test 4: Get File
async function testGetFile(fileId) {
  console.log('\n🔍 Test 4: Get File');
  
  const result = await apiRequest(`/api/files/${fileId}`, 'GET');
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Get file passed');
    console.log('   File name:', result.data.data.fileName);
    console.log('   File size:', result.data.data.fileSize);
    return true;
  } else {
    console.log('❌ Get file failed');
    console.log('   Error:', result.data);
    return false;
  }
}

// Test 5: Update Profile Picture
async function testProfilePicture() {
  console.log('\n🔍 Test 5: Update Profile Picture');
  
  const fileData = createTestImage();
  const uploadPayload = {
    profilePicture: `data:image/png;base64,${fileData}`
  };

  const result = await apiRequest(
    `/api/users/${userId}/profile-picture`,
    'POST',
    uploadPayload,
    authToken
  );
  
  if (result.status === 200) {
    console.log('✅ Profile picture update passed');
    console.log('   Profile picture:', result.data.data.profilePicture);
    return true;
  } else {
    console.log('❌ Profile picture update failed');
    console.log('   Error:', result.data);
    return false;
  }
}

// Test 6: Delete File
async function testDeleteFile(fileId) {
  console.log('\n🔍 Test 6: Delete File');
  
  const result = await apiRequest(`/api/files/${fileId}`, 'DELETE', null, authToken);
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Delete file passed');
    console.log('   Message:', result.data.message);
    return true;
  } else {
    console.log('❌ Delete file failed');
    console.log('   Error:', result.data);
    return false;
  }
}

// Test 7: File Validation (Size Limit)
async function testFileSizeValidation() {
  console.log('\n🔍 Test 7: File Size Validation');
  
  // Create a payload with file size exceeding limit
  const uploadPayload = {
    userId: userId,
    fileName: 'large-file.png',
    fileSize: 20 * 1024 * 1024, // 20MB (exceeds 5MB limit for products)
    fileType: 'image/png',
    fileData: createTestImage(),
    purpose: 'product'
  };

  const result = await apiRequest('/api/files/upload', 'POST', uploadPayload, authToken);
  
  if (result.status === 413) {
    console.log('✅ File size validation passed (correctly rejected)');
    console.log('   Error:', result.data.error);
    return true;
  } else {
    console.log('❌ File size validation failed (should have been rejected)');
    return false;
  }
}

// Test 8: File Type Validation
async function testFileTypeValidation() {
  console.log('\n🔍 Test 8: File Type Validation');
  
  const uploadPayload = {
    userId: userId,
    fileName: 'test.exe',
    fileSize: 1000,
    fileType: 'application/x-msdownload',
    fileData: createTestImage(),
    purpose: 'product'
  };

  const result = await apiRequest('/api/files/upload', 'POST', uploadPayload, authToken);
  
  if (result.status === 415) {
    console.log('✅ File type validation passed (correctly rejected)');
    console.log('   Error:', result.data.error);
    return true;
  } else {
    console.log('❌ File type validation failed (should have been rejected)');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting File Upload System Tests');
  console.log('=====================================');
  
  let passed = 0;
  let failed = 0;
  let fileId = null;

  // Test 1: Health Check
  if (await testHealthCheck()) passed++; else failed++;

  // Test 2: Register User
  if (await testRegister()) {
    passed++;
    
    // Test 3: Upload File
    fileId = await testFileUpload();
    if (fileId) {
      passed++;
      
      // Test 4: Get File
      if (await testGetFile(fileId)) passed++; else failed++;
      
      // Test 5: Update Profile Picture
      if (await testProfilePicture()) passed++; else failed++;
      
      // Test 6: Delete File
      if (await testDeleteFile(fileId)) passed++; else failed++;
    } else {
      failed++;
    }
    
    // Test 7: File Size Validation
    if (await testFileSizeValidation()) passed++; else failed++;
    
    // Test 8: File Type Validation
    if (await testFileTypeValidation()) passed++; else failed++;
    
  } else {
    failed++;
    console.log('\n⚠️  Skipping remaining tests due to registration failure');
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Test Summary');
  console.log('=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! File upload system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n❌ Server is not running!');
    console.log('Please start the server first:');
    console.log('  cd back');
    console.log('  npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runTests();
})();
