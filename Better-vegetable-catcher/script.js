// 模擬數據庫
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];

// DOM 元素
const notificationsList = document.getElementById('notificationsList');
const notificationModal = document.getElementById('notificationModal');
const notificationForm = document.getElementById('notificationForm');
const searchInput = document.getElementById('searchInput');
const addNotificationBtn = document.getElementById('addNotificationBtn');
const closeBtn = document.querySelector('.close');

// 事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    renderNotifications();
});

addNotificationBtn.addEventListener('click', () => {
    openModal();
});

closeBtn.addEventListener('click', () => {
    closeModal();
});

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredNotifications = notifications.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.content.toLowerCase().includes(searchTerm)
    );
    renderNotifications(filteredNotifications);
});

notificationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNotification();
});

// 渲染通知列表
function renderNotifications(notificationsToRender = notifications) {
    notificationsList.innerHTML = '';
    
    notificationsToRender.forEach(notification => {
        const card = document.createElement('div');
        card.className = 'notification-card';
        card.innerHTML = `
            <h3>${notification.title}</h3>
            <p>${notification.content}</p>
            <p><strong>開始時間：</strong>${formatDateTime(notification.startTime)}</p>
            <p><strong>結束時間：</strong>${formatDateTime(notification.endTime)}</p>
            <span class="notification-status ${notification.public ? 'status-public' : 'status-private'}">
                ${notification.public ? '公開' : '不公開'}
            </span>
            <div class="card-actions">
                <button onclick="editNotification('${notification.id}')" class="btn-primary">
                    <i class="fas fa-edit"></i> 編輯
                </button>
                <button onclick="deleteNotification('${notification.id}')" class="btn-secondary">
                    <i class="fas fa-trash"></i> 刪除
                </button>
            </div>
        `;
        notificationsList.appendChild(card);
    });
}

// 打開模態視窗
function openModal(notificationId = null) {
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (notificationId) {
        modalTitle.textContent = '編輯通知';
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            document.getElementById('notificationId').value = notification.id;
            document.getElementById('title').value = notification.title;
            document.getElementById('content').value = notification.content;
            document.getElementById('startTime').value = notification.startTime;
            document.getElementById('endTime').value = notification.endTime;
            document.getElementById('public').value = notification.public;
            document.getElementById('targetDevices').value = notification.targetDevices;
        }
    } else {
        modalTitle.textContent = '新增通知';
        notificationForm.reset();
        document.getElementById('notificationId').value = '';
    }
    
    modal.style.display = 'block';
}

// 關閉模態視窗
function closeModal() {
    notificationModal.style.display = 'none';
    notificationForm.reset();
}

// 儲存通知
function saveNotification() {
    const id = document.getElementById('notificationId').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const public = document.getElementById('public').value === 'true';
    const targetDevices = document.getElementById('targetDevices').value;

    const notification = {
        id: id || generateId(),
        title,
        content,
        startTime,
        endTime,
        public,
        targetDevices: targetDevices.split(',').map(device => device.trim())
    };

    if (id) {
        // 更新現有通知
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index] = notification;
        }
    } else {
        // 新增通知
        notifications.push(notification);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
    renderNotifications();
    closeModal();
}

// 編輯通知
function editNotification(id) {
    openModal(id);
}

// 刪除通知
function deleteNotification(id) {
    if (confirm('確定要刪除這個通知嗎？')) {
        notifications = notifications.filter(notification => notification.id !== id);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications();
    }
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期時間
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
} 