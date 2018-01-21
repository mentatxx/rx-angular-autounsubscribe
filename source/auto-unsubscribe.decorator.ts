/**
 * @license Copyright � 2018 Alexey Petushkov. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/mentatxx/rx-angular-autounsubscribe
 */
export function AutoUnsubscribe() {
  return (classProto, propertyName) => {
    // Symbols are the better way to store private data in components,
    // but in 2018 they are not yet supported in some "modern" browsers
    let internalKey = typeof Symbol === 'undefined' ? '___PRIVATE_AUTO_UNSUBSCRIBE___' + propertyName : Symbol('AutoUnsubscribe' + propertyName);

    classProto[internalKey] = classProto[propertyName];

    // tslint:disable-next-line:only-arrow-functions
    const getter = function () {
      return this[internalKey];
    };

    // tslint:disable-next-line:only-arrow-functions
    const setter = function (newSubscription) {
      const oldSubscription = this[internalKey];
      if (oldSubscription) {
        // auto unsubscribe first
        oldSubscription.unsubscribe();
      }
      this[internalKey] = newSubscription;
    };

    if (delete classProto[propertyName]) {
      Object.defineProperty(classProto, propertyName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }

    const oldNgOnDestroy = classProto.ngOnDestroy;
    // tslint:disable-next-line:only-arrow-functions
    classProto.ngOnDestroy = function () {
      // call previous method in  chain
      if (oldNgOnDestroy) {
        oldNgOnDestroy.call(this);
      }
      // unsubscribe
      const subscription = this[internalKey];
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  };
}
