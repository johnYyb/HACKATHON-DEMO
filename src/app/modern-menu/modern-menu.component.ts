import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface MenuItem {
  name: string;
  image: string;
  price: string;
  available: string;
  id?: number;
}

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  note: string;
  id: number;
}

interface SubmitOrderItem {
  name: string;
  quantity: number;
  price: number;
  icon: string;
  id: number;
}

interface SubmitOrderPayload {
  tableNumber: number;
  items: SubmitOrderItem[];
}

@Component({
  selector: 'app-modern-menu',
  templateUrl: './modern-menu.component.html',
  styleUrls: ['./modern-menu.component.scss'],
})
export class ModernMenuComponent {
  restaurantName = 'Chef Master';
  currentDate = new Date().toDateString();
  searchQuery = '';

  categories = [
    'Hot Dishes',
    'Cold Dishes',
    'Soup',
    'Grill',
    'Appetizer',
    'Dessert',
  ];
  activeCategory = 'Hot Dishes';

  orderTypes = ['Dine In', 'To Go', 'Delivery'];
  activeOrderType = 'Dine In';

  orderId = '#34562';
  tableNumber = 1;

  private itemIdCounter = 1;

  menuItems: MenuItem[] = [
    {
      name: 'Spicy seasoned seafood noodles',
      image: 'assets/image4.png',
      price: '$ 2.29',
      available: '20 Bowls available',
      id: 1,
    },
    {
      name: 'Salted Pasta with mushroom sauce',
      image: 'assets/image2.png',
      price: '$ 2.69',
      available: '11 Bowls available',
      id: 2,
    },
    {
      name: 'Beef dumpling in hot and sour soup',
      image: 'assets/image3.png',
      price: '$ 2.99',
      available: '16 Bowls available',
      id: 3,
    },
    {
      name: 'Healthy noodle with spinach leaf',
      image: 'assets/image6.png',
      price: '$ 3.29',
      available: '22 Bowls available',
      id: 4,
    },
    {
      name: 'Hot spicy fried rice with omelet',
      image: 'assets/image6.png',
      price: '$ 3.49',
      available: '13 Bowls available',
      id: 5,
    },
    {
      name: 'Spicy instant noodle with special omelette',
      image: 'assets/image5.png',
      price: '$ 3.59',
      available: '17 Bowls available',
      id: 6,
    },
  ];

  orderItems: OrderItem[] = [];

  // Notification state
  notification: {
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  } = {
    message: '',
    type: 'success',
    visible: false,
  };

  constructor(private http: HttpClient) {}

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification = { message, type, visible: true };
    setTimeout(() => {
      this.notification.visible = false;
    }, 3000);
  }

  get discount(): number {
    return 0;
  }

  get subTotal(): number {
    return this.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  selectCategory(cat: string) {
    this.activeCategory = cat;
  }

  selectOrderType(type: string) {
    this.activeOrderType = type;
  }

  addToOrder(item: MenuItem) {
    const existing = this.orderItems.find((o) =>
      o.name.startsWith(item.name.substring(0, 18)),
    );
    if (existing) {
      existing.quantity++;
    } else {
      this.orderItems.push({
        name:
          item.name.length > 20
            ? item.name.substring(0, 20) + '...'
            : item.name,
        image: item.image,
        price: parseFloat(item.price.replace('$ ', '')),
        quantity: 1,
        note: '',
        id: item.id ?? this.itemIdCounter++,
      });
    }
  }

  updateQuantity(orderItem: OrderItem, delta: number) {
    orderItem.quantity += delta;
    if (orderItem.quantity < 1) {
      this.removeOrderItem(orderItem);
    }
  }

  removeOrderItem(orderItem: OrderItem) {
    this.orderItems = this.orderItems.filter((o) => o !== orderItem);
  }

  continueToPayment() {
    const payload: SubmitOrderPayload = {
      tableNumber: this.tableNumber,
      items: this.orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        icon: item.image,
        id: item.id,
      })),
    };

    this.http.post('/orders', payload).subscribe({
      next: (response) => {
        console.log('Order submitted:', response);
        this.showNotification(
          'Order submitted successfully! Sub total: $' +
            this.subTotal.toFixed(2),
          'success',
        );
        // this.orderItems = [];
      },
      error: (error) => {
        console.error('Failed to submit order:', error);
        this.showNotification(
          'Failed to submit order. Please try again.',
          'error',
        );
      },
    });
  }
}
