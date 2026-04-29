import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule, TranslatePipe],
    template: `
    <mat-card>
      <mat-card-content>
        <p>{{ data.message }}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="onNo()">{{ 'common.no' | t }}</button>
        <button mat-flat-button color="warn" (click)="onYes()">{{ 'common.yes' | t }}</button>
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
