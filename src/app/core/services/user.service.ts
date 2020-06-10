import { Injectable } from '@angular/core';
import { UserApiService } from '../http';
import { Observable } from 'rxjs';
import { IUser, Page, PageRequest, User } from '../models';
import { select, Store } from '@ngrx/store';
import * as fromFeature from '../store/reducers';
import * as fromStore from '../store/selectors';
import { map, mergeMap, take } from 'rxjs/operators';

@Injectable()
export class UserService {
  constructor(private usersApiService: UserApiService,
              private store: Store<fromFeature.CoreState>) {
  }

  public list(pageRequest: PageRequest): Observable<Page<User>> {
    return this.usersApiService.list(pageRequest)
        .pipe(map(value => this.mapPage(value)));
  }

  public save(user: User): Observable<User> {
    return this.usersApiService.save(user.toJson()).pipe(
        map((iUser: IUser) => new User(iUser))
    );
  }

  public saveMultiple(): Observable<User[]> {
    return this.store.pipe(
        select(fromStore.getImportUsers),
        take(1),
        mergeMap(
            users => this.usersApiService.saveMultiple(users).pipe(map((theUsers: IUser[]) => theUsers.map(user => new User(user))))
        ));
  }

  public saveUsersExcel(usersExcel: string): Observable<IUser[]> {
    return this.usersApiService.saveExcel(usersExcel);
  }

  private fromResponse(userResponse: IUser): User {
    return new User(userResponse);
  }

  private mapPage(userPage: Page<IUser>): Page<User> {
    const result = new Page<User>(userPage);
    result.content = userPage.content.map(this.fromResponse);
    return result;
  }
}
