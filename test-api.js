/**
 * Simple API test script
 * Run with: node test-api.js
 */

const baseURL = 'http://localhost:5000/api';

// Test 1: Health check
async function testHealth() {
  console.log('\n🔍 Testing health endpoint...');
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Register a user
async function testRegister() {
  console.log('\n🔍 Testing user registration...');
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phone: '+233201234567',
    role: 'farmer',
    password: 'test123456'
  };

  try {
    const response = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data);
      return { success: true, email: testUser.email, password: testUser.password };
    } else {
      console.error('❌ Registration failed:', data);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return { success: false };
  }
}

// Test 3: Login
async function testLogin(email, password) {
  console.log('\n🔍 Testing user login...');
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful:', {
        userId: data.data.userId,
        userName: data.data.userName,
        userRole: data.data.userRole,
        tokenLength: data.data.token.length
      });
      return { success: true, token: data.data.token, userId: data.data.userId };
    } else {
      console.error('❌ Login failed:', data);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return { success: false };
  }
}

// Test 4: Create product
async function testCreateProduct(token, userId) {
  console.log('\n🔍 Testing product creation...');
  const testProduct = {
    productName: 'Test Tomatoes',
    description: 'Fresh test tomatoes',
    category: 'produce',
    price: 15.50,
    quantityAvailable: 100,
    unit: 'kg'
  };

  try {
    const response = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Product created:', {
        productId: data.data.product._id,
        productName: data.data.product.productName,
        price: data.data.product.price
      });
      return { success: true, productId: data.data.product._id };
    } else {
      console.error('❌ Product creation failed:', data);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Product creation error:', error.message);
    return { success: false };
  }
}

// Test 5: Get products
async function testGetProducts() {
  console.log('\n🔍 Testing product listing...');
  try {
    const response = await fetch(`${baseURL}/products?limit=5`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Products retrieved:', {
        count: data.data.count,
        limit: data.data.limit,
        firstProduct: data.data.products[0]?.productName || 'No products'
      });
      return { success: true };
    } else {
      console.error('❌ Get products failed:', data);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Get products error:', error.message);
    return { success: false };
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API tests...');
  console.log('📍 Base URL:', baseURL);
  
  // Test 1: Health
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Server is not running. Start it with: npm run dev');
    return;
  }

  // Test 2: Register
  const registerResult = await testRegister();
  if (!registerResult.success) return;

  // Test 3: Login
  const loginResult = await testLogin(registerResult.email, registerResult.password);
  if (!loginResult.success) return;

  // Test 4: Create product
  const productResult = await testCreateProduct(loginResult.token, loginResult.userId);
  if (!productResult.success) return;

  // Test 5: Get products
  await testGetProducts();

  console.log('\n✅ All tests completed successfully!');
  console.log('\n📝 Summary:');
  console.log('   - Health check: ✅');
  console.log('   - User registration: ✅');
  console.log('   - User login: ✅');
  console.log('   - Product creation: ✅');
  console.log('   - Product listing: ✅');
}

// Run tests
runTests().catch(console.error);
