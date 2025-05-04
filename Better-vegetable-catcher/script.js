document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.getElementById('notificationsList');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const totalNotifications = document.getElementById('totalNotifications');
    const todayNotifications = document.getElementById('todayNotifications');
    const lastUpdateTime = document.getElementById('lastUpdateTime');
    const pagination = document.getElementById('pagination');
    
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
    
    // 篩選通知
    function filterNotifications() {
        const searchTerm = searchInput.value.toLowerCase();
        const dateFilterValue = dateFilter.value;
        const today = new Date().toISOString().split('T')[0];
        
        let filtered = allNotifications.filter(notification => {
            const matchesSearch = 
                (notification.title || '').toLowerCase().includes(searchTerm) ||
                (notification.content || '').toLowerCase().includes(searchTerm);
            
            if (dateFilterValue === 'all') return matchesSearch;
            
            const notificationDate = notification.date;
            if (!notificationDate) return false;
            
            switch (dateFilterValue) {
                case 'today':
                    return matchesSearch && notificationDate === today;
                case 'week':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return matchesSearch && new Date(notificationDate) >= weekAgo;
                case 'month':
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return matchesSearch && new Date(notificationDate) >= monthAgo;
                default:
                    return matchesSearch;
            }
        });
        
        displayNotifications(filtered);
        updatePagination(filtered.length);
    }
    
    // 事件監聽器
    searchInput.addEventListener('input', filterNotifications);
    dateFilter.addEventListener('change', filterNotifications);
    
    // 初始載入
    loadNotifications();
    
    // 每5分鐘自動更新
    setInterval(() => {
        loadNotifications();
    }, 5 * 60 * 1000);
}); 