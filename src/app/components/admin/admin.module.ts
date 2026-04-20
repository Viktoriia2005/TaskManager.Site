import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

// Standalone components: import them into the module (do not declare)
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminRolesComponent } from './roles/admin-roles.component';
import { AdminCategoriesComponent } from './categories/admin-categories.component';
import { AdminTasksComponent } from './tasks/admin-tasks.component';
import { CategoryDialogComponent } from './categories/category-dialog.component';
import { ConfirmDialogComponent } from './categories/confirm-dialog.component'; // <-- latin 'c'

@NgModule({
    // Standalone components must NOT be listed in declarations.
    declarations: [],

    imports: [
        CommonModule,
        FormsModule,

        // Material modules
        MatToolbarModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatSortModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatCardModule,

        // Import standalone components so they are available in this module's scope.
        // This is the correct approach for standalone components in an NgModule.
        AdminLayoutComponent,
        AdminRolesComponent,
        AdminCategoriesComponent,
        AdminTasksComponent,
        CategoryDialogComponent,
        ConfirmDialogComponent
    ],

    exports: [
        // Export standalone components if other modules need them.
        AdminLayoutComponent,
        AdminRolesComponent,
        AdminCategoriesComponent,
        AdminTasksComponent
    ]
})
export class AdminModule { }
