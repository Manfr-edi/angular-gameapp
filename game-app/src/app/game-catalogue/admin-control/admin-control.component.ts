import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';
import { GameCollectionService } from 'src/app/services/game-collection.service';
import { UtilService } from 'src/app/services/util.service';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-admin-control',
  templateUrl: './admin-control.component.html',
  styleUrls: ['./admin-control.component.css']
})
export class AdminControlComponent implements OnChanges {

  @Input() gameid: string = "";

  show: boolean = false;

  constructor(private adminService: AdminService, private gameCollectionService: GameCollectionService,
    private util: UtilService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.gameid != "")
      this.show = true;
  }

  async deleteGame() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: this.util.capitalize(await this.gameCollectionService.getDataFieldGame(this.gameid, 'title'))
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true)
        this.adminService.deleteGame(this.gameid).then(r => {
          if (r)
            this.snackBar.open("Gioco eliminato correttamente", 'Ok', { duration: 2000 })
          else
            this.snackBar.open("Impossibile eliminare gioco", 'Ok', { duration: 2000 })
        })
    });
  }
}
