import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserData } from '../modals/User';
import swal from 'sweetalert2';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public userList = [];
  public userData: UserData;
  public userForm: FormGroup;
  public userEditForm: FormGroup;
  public prevFirst: any[];
  public prevFlag: boolean;
  public nextFlag: boolean;
  private pageSize: number;

  constructor(
    public fb: FormBuilder,
    private toastController: ToastController,
    private firebaseService: FirebaseService
  ) {
    this.pageSize = 3;
    this.prevFirst = [];
    this.prevFlag = true;
    this.nextFlag = false;
    this.userData = {} as UserData;
  }

  public ngOnInit() {
    const numberPattern = '^((\\+91-?)|0)?[0-9]{10}$';
    const emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,63}';
    this.userForm = this.fb.group({
      Name: ['', [Validators.required]],
      Number: ['', [Validators.required, Validators.pattern(numberPattern)]],
      Email: ['', [Validators.required, Validators.pattern(emailPattern)]]
    });
    this.userEditForm = this.fb.group({
      Name: ['', [Validators.required]],
      Number: ['', [Validators.required, Validators.pattern(numberPattern)]],
      Email: ['', [Validators.required, Validators.pattern(emailPattern)]]
    });
    this.getRecords();
  }

  /**
   * uf
   * @description user form controls reference
   */
  get uf() {
    return this.userForm.controls;
  }

  /**
   * uef
   * @description user form controls reference
   */
  get uef() {
    return this.userEditForm.controls;
  }

  /**
   * getRecords
   * @description get user details
   */
  public getRecords() {
    this.prevFirst = [];
    this.prevFlag = true;
    this.firebaseService.getUser(this.pageSize).subscribe(data => {
      this.userList = data.map(e => {
        return {
          id: e.payload.doc.id,
          isEdit: false,
          Name: e.payload.doc.get('Name'),
          Number: e.payload.doc.get('Number'),
          Email: e.payload.doc.get('Email'),
          timestamp: e.payload.doc.get('timestamp')
        };
      });
      if (this.userList.length < this.pageSize) {
        this.nextFlag = true;
      } else {
        this.nextFlag = false;
      }
    });
  }
  /**
   * createRecord
   * @description insert record in database
   */
  public createRecord() {
    const data = this.userForm.value;
    data.timestamp = new Date().getTime();
    this.firebaseService.createUser(data).then(resp => {
      swal.fire({
        title: 'Success',
        text: 'Record added...',
        timer: 1000,
        backdrop: false,
        background: 'white',
        icon: 'success'
      });
      this.userForm.reset();
      this.prevFirst = [];
      this.prevFlag = true;
      this.nextFlag = false;
    })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * removeRecord
   * @param rowID record id
   * @description delete record from database
   */
  public removeRecord(rowID) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this record?',
      icon: 'question',
      showCancelButton: true,
      backdrop: false,
      background: 'white',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then((data) => {
      if (data && data.value) {
        this.firebaseService.deleteUser(rowID);
        swal.fire({
          title: 'Success',
          text: 'Record deleted...',
          timer: 1000,
          backdrop: false,
          background: 'white',
          icon: 'success'
        });
        this.getRecords();
      }
    });
  }

  /**
   * editRecord
   * @param record record detail
   * @description open edit form
   */
  public editRecord(record) {
    record.isEdit = true;
    this.userEditForm.patchValue({ Name: record.Name, Number: record.Number, Email: record.Email });
  }

  /**
   * updateRecord
   * @param recordRow record detail for update
   * @description update record in database
   */
  public updateRecord(recordRow) {
    this.firebaseService.updateUser(recordRow.id, this.userEditForm.value);
    swal.fire({
      title: 'Success',
      text: 'Record updated...',
      timer: 1000,
      backdrop: false,
      background: 'white',
      icon: 'success'
    });
    recordRow.isEdit = false;
  }

  /**
   * nextRecord
   * @description get next data
   */
  public nextRecord() {
    this.prevFirst.push(this.userList[0].timestamp);
    if (this.prevFirst.length > 0) {
      this.prevFlag = false;
    } else {
      this.prevFlag = true;
    }
    this.firebaseService.nextUser(this.pageSize, this.userList[this.userList.length - 1]).subscribe(data => {
      if (data.length > 0) {
        this.userList = data.map(e => {
          return {
            id: e.payload.doc.id,
            isEdit: false,
            Name: e.payload.doc.get('Name'),
            Number: e.payload.doc.get('Number'),
            Email: e.payload.doc.get('Email'),
            timestamp: e.payload.doc.get('timestamp')
          };
        });
        if (this.userList.length < this.pageSize) {
          this.nextFlag = true;
        } else {
          this.nextFlag = false;
        }
      } else {
        this.nextFlag = true;
        this.prevFirst.pop();
        this.showToast();
      }
    });
  }

  /**
   * prevRecord
   * @description get previous data
   */
  public prevRecord() {
    this.firebaseService.prevUser(this.pageSize, this.prevFirst[this.prevFirst.length - 1], this.userList[0]).subscribe(data => {
      this.userList = data.map(e => {
        return {
          id: e.payload.doc.id,
          isEdit: false,
          Name: e.payload.doc.get('Name'),
          Number: e.payload.doc.get('Number'),
          Email: e.payload.doc.get('Email'),
          timestamp: e.payload.doc.get('timestamp')
        };
      });
      this.prevFirst.pop();
      if (this.userList.length < this.pageSize) {
        this.nextFlag = true;
      } else {
        this.nextFlag = false;
      }
      if (this.prevFirst.length > 0) {
        this.prevFlag = false;
      } else {
        this.prevFlag = true;
      }
    });
  }

  public async showToast() {
    const toast = await this.toastController.create({
      color: 'dark',
      duration: 2000,
      message: 'No more records found...'
    });

    await toast.present();
  }
}
