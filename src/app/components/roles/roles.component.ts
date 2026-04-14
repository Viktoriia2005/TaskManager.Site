import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService, Role } from '../../services/roles.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];

  constructor(private rolesService: RolesService) { }

  ngOnInit(): void {
    this.rolesService.getRoles().subscribe(data => {
      this.roles = data;
    });
  }
}
