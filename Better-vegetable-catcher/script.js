document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.getElementById('notificationsList');
    const searchInput = document.getElementById('searchInput');
    const totalNotifications = document.getElementById('totalNotifications');
    const todayNotifications = document.getElementById('todayNotifications');
    const lastUpdateTime = document.getElementById('lastUpdateTime');
    const pagination = document.getElementById('pagination');
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalTitle');
    const notificationForm = document.getElementById('notificationForm');
    const addNotificationBtn = document.getElementById('addNotificationBtn');
    const closeBtn = document.querySelector('.close');
    
    let allNotifications = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // 載入通知資料
    async function loadNotifications() {
        try {
            const response = await fetch('notfiy.json');
            const data = await response.json();
            allNotifications = data;
            updateStats(data);
            displayNotifications(data);
            updatePagination(data.length);
            updateLastUpdateTime();
        } catch (error) {
            console.error('載入資料時發生錯誤:', error);
            notificationsList.innerHTML = '<div class="error-message">無法載入通知資料</div>';
        }
    }
    
    // 更新統計資料
    function updateStats(notifications) {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = notifications.filter(n => n.date === today).length;
        
        totalNotifications.textContent = notifications.length;
        todayNotifications.textContent = todayCount;
    }
    
    // 更新最後更新時間
    function updateLastUpdateTime() {
        const now = new Date();
        lastUpdateTime.textContent = now.toLocaleString('zh-TW');
    }
    
    // 顯示通知
    function displayNotifications(notifications) {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedNotifications = notifications.slice(start, end);
        
        notificationsList.innerHTML = '';
        
        paginatedNotifications.forEach(notification => {
            const card = document.createElement('div');
            card.className = 'notification-card';
            card.innerHTML = `
                <div class="notification-title">
                    <i class="fas fa-info-circle"></i>
                    ${notification.title || '無標題'}
                </div>
                <div class="notification-content">${notification.content || '無內容'}</div>
                <div class="notification-footer">
                    <span class="notification-date">
                        <i class="fas fa-calendar"></i>
                        ${notification.date || '無日期'}
                    </span>
                    <span class="notification-type">
                        <i class="fas fa-tag"></i>
                        ${notification.type || '一般通知'}
                    </span>
                </div>
                <div class="notification-actions">
                    <button class="edit-btn" onclick="editNotification('${notification.id}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="delete-btn" onclick="deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            `;
            notificationsList.appendChild(card);
        });
    }
    
    // 更新分頁
    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        pagination.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = i === currentPage ? 'active' : '';
            button.onclick = () => {
                currentPage = i;
                displayNotifications(allNotifications);
                updatePagination(allNotifications.length);
            };
            pagination.appendChild(button);
        }
    }
    
    // 篩選通知（只根據搜尋框）
    function filterNotifications() {
        const searchTerm = searchInput.value.toLowerCase();
        let filtered = allNotifications.filter(notification => {
            return (
                (notification.title || '').toLowerCase().includes(searchTerm) ||
                (notification.content || '').toLowerCase().includes(searchTerm)
            );
        });
        displayNotifications(filtered);
        updatePagination(filtered.length);
    }
    
    // 開啟模態視窗
    function openModal(notification = null) {
        modal.style.display = 'block';
        if (notification) {
            modalTitle.textContent = '編輯通知';
            document.getElementById('notificationId').value = notification.id;
            document.getElementById('title').value = notification.title;
            document.getElementById('content').value = notification.content;
            const [startTime, endTime] = notification.time.split(' ~ ');
            document.getElementById('startTime').value = startTime.replace('T', ' ');
            document.getElementById('endTime').value = endTime.replace('T', ' ');
            document.getElementById('public').value = notification.public.toString();
            document.getElementById('targetDevices').value = notification.targetDevices ? notification.targetDevices.join(', ') : '';
        } else {
            modalTitle.textContent = '新增通知';
            notificationForm.reset();
        }
    }
    
    // 關閉模態視窗
    function closeModal() {
        modal.style.display = 'none';
        notificationForm.reset();
    }
    
    // 編輯通知
    window.editNotification = function(id) {
        const notification = allNotifications.find(n => n.id === id);
        if (notification) {
            openModal(notification);
        }
    };
    
    // 刪除通知
    window.deleteNotification = async function(id) {
        if (confirm('確定要刪除這個通知嗎？')) {
            allNotifications = allNotifications.filter(n => n.id !== id);
            await saveNotifications();
            displayNotifications(allNotifications);
            updatePagination(allNotifications.length);
        }
    };
    
    // 儲存通知
    async function saveNotifications() {
        try {
            const response = await fetch('notfiy.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(allNotifications, null, 2)
            });
            if (!response.ok) {
                throw new Error('儲存失敗');
            }
        } catch (error) {
            console.error('儲存資料時發生錯誤:', error);
            alert('儲存失敗，請稍後再試');
        }
    }
    
    // 處理表單提交
    notificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('notificationId').value || generateId();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const public = document.getElementById('public').value === 'true';
        const targetDevices = document.getElementById('targetDevices').value
            .split(',')
            .map(device => device.trim())
            .filter(device => device);
        
        const notification = {
            id,
            title,
            content,
            time: `${startTime} ~ ${endTime}`,
            public,
            targetDevices
        };
        
        if (document.getElementById('notificationId').value) {
            // 更新現有通知
            const index = allNotifications.findIndex(n => n.id === id);
            if (index !== -1) {
                allNotifications[index] = notification;
            }
        } else {
            // 新增通知
            allNotifications.unshift(notification);
        }
        
        await saveNotifications();
        displayNotifications(allNotifications);
        updatePagination(allNotifications.length);
        closeModal();
    });
    
    // 生成唯一ID
    function generateId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${year}${month}${day}${random}`;
    }
    
    // 事件監聽器
    searchInput.addEventListener('input', filterNotifications);
    addNotificationBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 初始載入
    loadNotifications();
    
    // 每5分鐘自動更新
    setInterval(() => {
        loadNotifications();
    }, 5 * 60 * 1000);
}); 