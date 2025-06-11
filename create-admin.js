// Quick script to create master admin account
const registerAdmin = async () => {
  const adminData = {
    name: "Emanuel Dario",
    email: "emanueldario.dev@gmail.com",
    password: "Admin123!",
    confirmPassword: "Admin123!",
    role: "Admin",
    phone: "",
    address: ""
  };

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const result = await response.json();
    console.log('Registration result:', result);
  } catch (error) {
    console.error('Registration error:', error);
  }
};

registerAdmin();
