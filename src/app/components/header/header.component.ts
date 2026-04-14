import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() userName = 'User';
  @Input() tasks: { id: number; title: string }[] = [];
  @Output() logoutClick = new EventEmitter<void>();

  showTasksMenu = false;
  showUserMenu = false;

  toggleTasksMenu(): void {
    this.showTasksMenu = !this.showTasksMenu;
    if (this.showTasksMenu) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showTasksMenu = false;
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.logoutClick.emit();
  }
}
