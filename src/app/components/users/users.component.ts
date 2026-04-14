import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.usersService.getUsers().subscribe(data => {
      this.users = data;
    });
  }
}
