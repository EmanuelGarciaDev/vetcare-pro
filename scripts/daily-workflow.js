const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Trello configuration
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;

console.log('🔍 Debug: API Key:', TRELLO_API_KEY ? `${TRELLO_API_KEY.substring(0, 8)}...` : 'Missing');
console.log('🔍 Debug: Token:', TRELLO_TOKEN ? `${TRELLO_TOKEN.substring(0, 8)}...` : 'Missing');

// We'll find the correct board ID dynamically
let BOARD_ID = '672b3f5c92d7bfe8b9c8ea8c'; // Fallback

// List IDs for VetCare-Pro board (will be updated after finding the board)
const LIST_IDS = {
  TODO: '672b3f5c92d7bfe8b9c8ea8d',        // "Lista de tareas"
  IN_PROGRESS: '672b3f5c92d7bfe8b9c8ea8e',  // "En proceso"
  DONE: '672b3f5c92d7bfe8b9c8ea8f'         // "Hecho"
};

// Utility function to make HTTPS requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Get all boards for the user
async function getAllBoards() {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'GET'
  };
  
  return await makeRequest(options);
}

// Find VetCare board
async function findVetCareBoard() {
  try {
    const boards = await getAllBoards();
    
    if (typeof boards === 'string' && boards.includes('invalid')) {
      console.log('❌ Invalid Trello credentials');
      return null;
    }
    
    console.log('🔍 Available boards:');
    boards.forEach((board, index) => {
      console.log(`   ${index + 1}. "${board.name}" (ID: ${board.id})`);
    });
      // Look for VetCare board (more specific search)
    const vetCareBoard = boards.find(board => 
      board.name.toLowerCase().includes('vetcare') || 
      board.name.toLowerCase() === 'vetcare-pro'
    );
    
    if (vetCareBoard) {
      console.log(`✅ Found VetCare board: "${vetCareBoard.name}" (${vetCareBoard.id})`);
      BOARD_ID = vetCareBoard.id;
      return vetCareBoard;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding boards:', error.message);
    return null;
  }
}

// Get lists from a board
async function getBoardLists(boardId) {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'GET'
  };
  
  return await makeRequest(options);
}

// Get all cards from the board
async function getCards() {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/boards/${BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'GET'
  };
  
  return await makeRequest(options);
}

// Get board information
async function getBoardInfo() {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/boards/${BOARD_ID}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'GET'
  };
  
  return await makeRequest(options);
}

// Move card to a different list
async function moveCard(cardId, listId) {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const postData = JSON.stringify({ idList: listId });
  return await makeRequest(options, postData);
}

// Add comment to card
async function addCommentToCard(cardId, comment) {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/cards/${cardId}/actions/comments?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const postData = JSON.stringify({ text: comment });
  return await makeRequest(options, postData);
}

// Create a new card
async function createCard(name, desc, listId) {
  const options = {
    hostname: 'api.trello.com',
    path: `/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const postData = JSON.stringify({ 
    name: name,
    desc: desc,
    idList: listId 
  });
  
  return await makeRequest(options, postData);
}

// Create new project cards
async function createProjectCards() {
  console.log('🚀 Creating New Project Cards...');
  
  try {
    // Find the correct VetCare board
    const vetCareBoard = await findVetCareBoard();
    if (!vetCareBoard) {
      console.log('❌ Could not find VetCare board');
      return;
    }
    
    // Get the lists
    const lists = await getBoardLists(BOARD_ID);
    const todoList = lists.find(list => 
      list.name.toLowerCase().includes('todo') || 
      list.name.toLowerCase().includes('tareas')
    );
    
    if (!todoList) {
      console.log('❌ Could not find TODO list');
      return;
    }
    
    const cards = [
      {
        name: '🗃️ DATABASE ARCHITECTURE CLEANUP',
        desc: `**PRIORITY: CRITICAL** ⚠️

**Problem**: Inconsistent data model with duplicate collections causing data integrity issues

**Current Issues**:
- Users collection mixing customers/veterinarians/admins 
- Separate veterinarians collection (redundant)
- Multiple vet-clinics collections
- Data inconsistencies blocking booking flow

**Solution**:
1. Analyze current collections and relationships
2. Design clean, single-source schema
3. Consolidate users into role-based single collection
4. Remove duplicate vet-clinics collections
5. Migrate data carefully (visible changes only)
6. Update all API endpoints to use new schema

**Success Criteria**:
- Single users collection with role field
- Single vet-clinics collection
- All APIs working with clean data
- Booking flow resolves "No veterinarian available" errors

**Dependencies**: Blocks all other features - MUST be done first`
      },
      {
        name: '💳 PAYMENT TESTING & SIMULATION',
        desc: `**Problem**: Payment integration blocks complete booking flow testing

**Current Issues**:
- Can't test full booking flow without real payments
- Need realistic payment simulation for demo
- Mock payment system needs enhancement

**Solution**:
1. Enhanced mock payment system with multiple methods
2. Success/failure scenario testing
3. Receipt generation for completed bookings
4. Test mode toggle in environment
5. Keep Stripe integration but with proper test mode

**Features to Add**:
- Credit Card simulation
- PayPal simulation
- Payment success/failure flows
- Generated receipts with booking details
- Test transaction logging

**Success Criteria**:
- Complete booking flow testable without real charges
- Realistic payment UI/UX
- All payment methods working in test mode
- Receipt generation functional`
      },
      {
        name: '🎯 USER-FOCUSED DASHBOARD REDESIGN',
        desc: `**Problem**: Current dashboard doesn't match user mental model and needs

**User Story**: "As a pet owner, I want to see my pets and manage appointments in one unified interface"

**Current Issues**:
- Dashboard layout confusing
- Appointment management scattered
- Booking flow separate from dashboard

**Solution - Single Dashboard with Integrated Tabs**:

**Tab 1: My Pets**
- Grid view with pet cards
- Quick pet info and photos
- "Add New Pet" action

**Tab 2: My Appointments** 
- Timeline view: Past, Today, Upcoming
- Appointment details and status
- Quick actions (reschedule, cancel)

**Tab 3: Book New Appointment**
- Integrated booking flow within dashboard
- Pet selection, date/time, clinic selection
- Payment processing in same tab

**Design Goals**:
- Clean, modern interface
- Mobile-responsive
- Intuitive navigation
- All pet care in one place

**Success Criteria**:
- User can manage entire pet care journey from one dashboard
- Booking flow integrated seamlessly
- Mobile and desktop optimized`
      },
      {
        name: '⏰ PET CARE REMINDER SYSTEM',
        desc: `**Problem**: Pet owners forget important care schedules leading to health issues

**Business Value**: Increases user engagement, improves pet health outcomes, differentiates from competitors

**Current State**: No reminder system exists

**Solution - Smart Reminder System**:

**Core Features**:
1. **Vaccination Tracking**
   - Auto-schedule based on pet age/species
   - Custom vaccination reminder creation
   - Vet-recommended schedules

2. **Custom Care Reminders**
   - Flea/tick treatments
   - Dental care
   - Grooming appointments
   - Medication schedules

3. **Notification System**
   - Email notifications
   - In-app notifications
   - Configurable reminder timing (1 week, 3 days, 1 day before)

4. **Smart Scheduling**
   - Integration with appointment booking
   - "Book Now" buttons in reminders
   - Calendar integration

**Technical Implementation**:
- Background job system for reminder processing
- Email template system
- User notification preferences
- Reminder history and tracking

**Success Criteria**:
- Pet owners receive timely care reminders
- Increased appointment bookings from reminders
- User satisfaction with proactive care management`
      }
    ];
    
    console.log('📝 Creating cards...');
    
    for (const cardData of cards) {
      console.log(`   Creating: ${cardData.name}`);
      const result = await createCard(cardData.name, cardData.desc, todoList.id);
      if (result.id) {
        console.log(`   ✅ Created successfully`);
      } else {
        console.log(`   ❌ Failed to create: ${JSON.stringify(result)}`);
      }
    }
    
    console.log('🎉 All project cards created successfully!');
    console.log('📋 Next: Run "npm run workflow:start" to see updated board status');
    
  } catch (error) {
    console.error('❌ Error creating cards:', error.message);
  }
}

// Main workflow functions
async function startWorkflow() {
  console.log('🌅 Starting Daily Development Workflow');
  console.log('📋 Connecting to VetCare Trello Board...');
  
  try {
    console.log('🔍 Finding your VetCare board...');
    
    // First, find the correct VetCare board
    const vetCareBoard = await findVetCareBoard();
    
    if (!vetCareBoard) {
      console.log('❌ Could not find VetCare board. Please check:');
      console.log('   1. Your Trello API credentials are correct');
      console.log('   2. You have a board with "VetCare", "Vet", or "Care" in the name');
      console.log('   3. The board is accessible with your token');
      return;
    }
    
    // Get the lists from the board
    console.log('🔍 Getting board lists...');
    const lists = await getBoardLists(BOARD_ID);
    
    if (Array.isArray(lists)) {
      console.log('📋 Available lists:');
      lists.forEach((list, index) => {
        console.log(`   ${index + 1}. "${list.name}" (ID: ${list.id})`);
      });
      
      // Update LIST_IDS based on actual list names
      const todoList = lists.find(list => 
        list.name.toLowerCase().includes('todo') || 
        list.name.toLowerCase().includes('tareas') ||
        list.name.toLowerCase().includes('to do')
      );
      
      const progressList = lists.find(list => 
        list.name.toLowerCase().includes('progress') || 
        list.name.toLowerCase().includes('proceso') ||
        list.name.toLowerCase().includes('doing') ||
        list.name.toLowerCase().includes('working')
      );
      
      const doneList = lists.find(list => 
        list.name.toLowerCase().includes('done') || 
        list.name.toLowerCase().includes('hecho') ||
        list.name.toLowerCase().includes('complete')
      );
      
      if (todoList) LIST_IDS.TODO = todoList.id;
      if (progressList) LIST_IDS.IN_PROGRESS = progressList.id;
      if (doneList) LIST_IDS.DONE = doneList.id;
      
      console.log('✅ Updated list IDs:');
      console.log(`   TODO: ${LIST_IDS.TODO} (${todoList?.name || 'Not found'})`);
      console.log(`   IN_PROGRESS: ${LIST_IDS.IN_PROGRESS} (${progressList?.name || 'Not found'})`);
      console.log(`   DONE: ${LIST_IDS.DONE} (${doneList?.name || 'Not found'})`);
    }
    
    // Now get the cards
    console.log('🔍 Fetching cards...');
    const cards = await getCards();
    
    // Ensure cards is an array
    const cardList = Array.isArray(cards) ? cards : [];
    
    const todoCards = cardList.filter(card => card.idList === LIST_IDS.TODO);
    const inProgressCards = cardList.filter(card => card.idList === LIST_IDS.IN_PROGRESS);
    
    console.log(`📊 Board: ${vetCareBoard.name}`);
    console.log(`🔄 In Progress: ${inProgressCards.length} cards`);
    console.log(`📋 To Do: ${todoCards.length} cards`);
    
    console.log('\n🗺️ TODAY\'S DEVELOPMENT PLAN:');
    
    if (inProgressCards.length > 0) {
      console.log('🔄 CONTINUE WORKING ON:');
      inProgressCards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.name}`);
      });
    }
    
    if (todoCards.length > 0) {
      console.log('\n📋 NEXT TASKS TO START:');
      todoCards.slice(0, 5).forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.name}`);
      });
    }
    
    if (cardList.length > 0) {
      console.log('\n📋 ALL CARDS FOUND:');
      cardList.forEach((card, index) => {
        console.log(`   ${index + 1}. "${card.name}" (List ID: ${card.idList})`);
      });
    } else {
      console.log('\n📝 No cards found. Your board appears to be empty.');
      console.log('💡 Create some cards in your Trello board to see them here!');
    }
    
    console.log('\n💡 Use "npm run workflow:complete" when you\'re done with your work!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Debug info:', error);
  }
}

async function statusCheck() {
  try {
    const cards = await getCards();
    
    // Ensure cards is an array
    const cardList = Array.isArray(cards) ? cards : [];
    
    const todoCards = cardList.filter(card => card.idList === LIST_IDS.TODO);
    const inProgressCards = cardList.filter(card => card.idList === LIST_IDS.IN_PROGRESS);
    
    console.log('📊 QUICK STATUS:');
    console.log(`🔄 In Progress: ${inProgressCards.length}`);
    console.log(`📋 To Do: ${todoCards.length}`);
    
    if (inProgressCards.length > 0) {
      console.log('🔄 Current Work:');
      inProgressCards.forEach(card => {
        console.log(`   • 🔄 ${card.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function startTask(taskName) {
  try {
    const cards = await getCards();
    const todoCards = cards.filter(card => card.idList === LIST_IDS.TODO);
    
    const matchingCard = todoCards.find(card => 
      card.name.toLowerCase().includes(taskName.toLowerCase())
    );
    
    if (!matchingCard) {
      console.log(`❌ Task "${taskName}" not found in To Do list`);
      return;
    }
    
    await moveCard(matchingCard.id, LIST_IDS.IN_PROGRESS);
    await addCommentToCard(matchingCard.id, `Started working on this task - ${new Date().toLocaleString()}`);
    
    console.log(`✅ Moved "${matchingCard.name}" to In Progress`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function completeWorkflow() {
  console.log('🚀 Starting Completion Workflow...');
  
  try {
    // Stage 1: Git Operations
    console.log('📝 Stage 1: Git Operations');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    console.log('   📁 Adding files...');
    await execAsync('git add .');
    
    console.log('   💾 Committing changes...');
    const commitMessage = `Daily development update - ${new Date().toLocaleString()}`;
    await execAsync(`git commit -m "${commitMessage}"`);
    
    console.log('   ⬆️ Pushing to remote...');
    await execAsync('git push origin main');
    console.log('   ✅ Git operations completed');
    
    // Stage 2: Vercel Deployment
    console.log('\n🚀 Stage 2: Vercel Deployment');
    console.log('   🚀 Deploying to Vercel...');
    
    try {
      const { stdout } = await execAsync('vercel --prod');
      const deploymentUrl = stdout.trim().split('\n').pop();
      console.log(`   ✅ Deployed successfully: ${deploymentUrl}`);
      
      // Stage 3: Update Trello Cards
      console.log('\n📋 Stage 3: Update Trello Cards');
      const cards = await getCards();
      const inProgressCards = cards.filter(card => card.idList === LIST_IDS.IN_PROGRESS);
      
      for (const card of inProgressCards) {
        console.log(`   📋 Updating: ${card.name}`);
        await moveCard(card.id, LIST_IDS.DONE);
        await addCommentToCard(card.id, `Completed and deployed - ${new Date().toLocaleString()}\nDeployment: ${deploymentUrl}`);
      }
      
      console.log(`   ✅ Updated ${inProgressCards.length} cards to Done`);
      
      console.log('\n🎉 Workflow completed successfully!');
      console.log(`🔗 Deployment: ${deploymentUrl}`);
      
    } catch (deployError) {
      console.log('   ⚠️ Vercel deployment failed, but continuing with Trello updates...');
      
      // Still update Trello even if deployment fails
      const cards = await getCards();
      const inProgressCards = cards.filter(card => card.idList === LIST_IDS.IN_PROGRESS);
      
      for (const card of inProgressCards) {
        console.log(`   📋 Updating: ${card.name}`);
        await moveCard(card.id, LIST_IDS.DONE);
        await addCommentToCard(card.id, `Completed - ${new Date().toLocaleString()}`);
      }
      
      console.log(`   ✅ Updated ${inProgressCards.length} cards to Done`);
      console.log('\n🎉 Workflow completed (deployment failed but Trello updated)!');
    }
    
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
  }
}

// Main execution
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'start':
    startWorkflow();
    break;
  case 'status':
    statusCheck();
    break;
  case 'task':
    if (!arg) {
      console.log('❌ Please provide a task name: npm run workflow:task "task name"');
    } else {
      startTask(arg);
    }
    break;
  case 'complete':
    completeWorkflow();
    break;
  case 'create-cards':
    createProjectCards();
    break;
  default:
    console.log('Available commands:');
    console.log('  npm run workflow:start       - Start daily workflow');
    console.log('  npm run workflow:status      - Quick status check');
    console.log('  npm run workflow:task "name" - Start specific task');
    console.log('  npm run workflow:complete    - Complete and deploy');
    console.log('  npm run workflow:create-cards - Create project cards');
}
