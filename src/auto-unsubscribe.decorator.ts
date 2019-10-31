/**
 * @license Copyright � 2018 Alexey Petushkov. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/mentatxx/rx-angular-autounsubscribe
 */
export function AutoUnsubscribe() {
  const PREFIX = '__SHADOW__';
  return (target: any, key: string) => {
    target[PREFIX + key] = target[key];

    // property getter
    // tslint:disable-next-line:only-arrow-functions
    const getter = function() {
      return this[PREFIX + key];
    };

    // property setter
    // tslint:disable-next-line:only-arrow-functions
    const setter = function(newVal: any) {
      const val = this[PREFIX + key];
      if (val) {
        // auto unsubscribe first
        val.unsubscribe();
      }
      this[PREFIX + key] = newVal;
    };

    if (delete target[key]) {
      // Create new property with getter and setter
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }

    // Register On Destroy handler
    const oldNgOnDestroy = target.ngOnDestroy;
    if (!oldNgOnDestroy) {
      const msg =
        'AutoUnsubscribe() decorator applied for class not inherited from AutoUnsubscribableComponent';
      console.error(new Error(msg));
    }
    // tslint:disable-next-line:only-arrow-functions
    target.ngOnDestroy = function() {
      // call previous method in  chain
      if (oldNgOnDestroy) {
        oldNgOnDestroy.call(this);
      }
      // unsubscribe
      const val = this[PREFIX + key];
      if (val) {
        val.unsubscribe();
      }
    };
  };
}
