import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule],
    template: `
    <mat-card>
      <mat-card-content>
        <p>{{ data.message }}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="onNo()">No</button>
        <button mat-flat-button color="warn" (click)="onYes()">Yes</button>
      </mat-card-actions>
    </mat-card>
  `
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) { }

    onYes(): void {
        this.dialogRef.close(true);
    }

    onNo(): void {
        this.dialogRef.close(false);
    }
}