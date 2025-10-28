// // helpers/itemFactory.js
import { Item } from "../../entities/ItemManager";

// export function createItemFromAsset(asset, mesh = null) {
//   const item = new Item(mesh);
//   Object.assign(item, asset); // Assign properties like name, icon, etc.
//   item.consumable = asset.type === "consumable";
//   item.useEffect = asset.useEffect || null;
//   return item;
// }
export function createItemFromAsset(asset, mesh = null) {
  const item = new Item(mesh);
  Object.assign(item, asset); // Assign properties like name, icon, etc.

  item.quantity = asset.quantity ?? 1; // This is used when adding to inventory
  item.stackable = asset.stackable ?? false;
  item.maxStack = asset.maxStack ?? 1;
  item.consumable = asset.type === "consumable";
  item.useEffect = asset.useEffect || null;

  return item;
}
