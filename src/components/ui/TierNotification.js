export class TierNotification {
  constructor(root) {
    this.root = root;
  }

  show(tier) {
    let notification = document.getElementById('tier-upgrade-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'tier-upgrade-notification';
      notification.className = 'tier-notification';
      this.root.appendChild(notification);
    }

    const { name, color, icon } = this._getTierInfo(tier);
    
    notification.innerHTML = `
      <div class="tier-notification-content">
        <div class="tier-icon" style="background: ${color}">${icon}</div>
        <div class="tier-text">
          <h3>Tier Upgraded!</h3>
          <p>You've reached <span style="color: ${color}">${name}</span> status</p>
        </div>
      </div>
    `;

    notification.style.display = 'block';
    notification.style.opacity = '1';

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 500);
    }, 5000);
  }

  _getTierInfo(tier) {
    switch (tier.toLowerCase()) {
      case 'veteran':
        return { name: 'Veteran', color: '#c0c0c0', icon: '🥈' };
      case 'legend':
        return { name: 'Legend', color: '#ffd700', icon: '🏆' };
      default:
        return { name: 'Rookie', color: '#cd7f32', icon: '🎖️' };
    }
  }
}