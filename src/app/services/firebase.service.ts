import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserData } from '../modals/User';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private collectionName = 'User';

  constructor(
    private firestore: AngularFirestore
  ) { }

  /**
   * createUser
   * @param record data to insert in database
   * @description To insert record in database
   */
  public createUser(record: UserData) {
    return this.firestore.collection(this.collectionName).add(record);
  }

  /**
   * getUser
   * @param pageSize size of page limit
   * @description To get records from database
   */
  public getUser(pageSize: number) {
    return this.firestore.collection(this.collectionName, ref =>
      ref.limit(pageSize).orderBy('timestamp', 'desc')).snapshotChanges();
  }
  /**
   * getUser
   * @param pageSize size of page limit
   * @param obj User detail
   * @description To get next records from database
   */
  public nextUser(pageSize: number, obj: UserData) {
    return this.firestore.collection(this.collectionName, ref =>
      ref.limit(3).orderBy('timestamp', 'desc').startAfter(obj.timestamp)).snapshotChanges();
  }
  /**
   * prevUser
   * @param pageSize size of page limit
   * @param prev last page start value
   * @param obj user detail
   * @description To get previous records from database
   */
  public prevUser(pageSize: number, prev: number, obj: UserData) {
    return this.firestore.collection(this.collectionName, ref =>
      ref.limit(3).orderBy('timestamp', 'desc').startAt(prev).endBefore(obj.timestamp)).snapshotChanges();
  }

  /**
   * updateUser
   * @param recordID id of data to update
   * @param record data to update
   * @description To update the data in database
   */
  public updateUser(recordID, record) {
    this.firestore.doc(this.collectionName + '/' + recordID).update(record);
  }

  /**
   * deleteUser
   * @param recordId id of data to delete
   * @description To delete data in database
   */
  public deleteUser(recordId) {
    this.firestore.doc(this.collectionName + '/' + recordId).delete();
  }
}
