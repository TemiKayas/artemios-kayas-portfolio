// Auto-generated: pixel sprite sizes in art pixels (public/game/*.png)
export const SPRITES = {
 "ach_bunny": [
  43,
  46
 ],
 "ach_chest": [
  42,
  46
 ],
 "ach_gradcap": [
  42,
  46
 ],
 "ach_keyboards": [
  43,
  46
 ],
 "ach_medal": [
  43,
  46
 ],
 "ach_moon": [
  43,
  46
 ],
 "ach_rocket": [
  43,
  46
 ],
 "ach_star": [
  43,
  46
 ],
 "ach_sun": [
  43,
  46
 ],
 "ach_trophy": [
  43,
  46
 ],
 "bg_far": [
  453,
  107
 ],
 "bg_mid": [
  528,
  130
 ],
 "bird0": [
  25,
  26
 ],
 "bird0_s": [
  12,
  13
 ],
 "bird1": [
  27,
  20
 ],
 "bird1_s": [
  13,
  10
 ],
 "boulder": [
  48,
  36
 ],
 "boulder_s": [
  24,
  18
 ],
 "bunny0": [
  24,
  27
 ],
 "bunny0_s": [
  12,
  13
 ],
 "bunny1": [
  28,
  23
 ],
 "bunny1_s": [
  14,
  11
 ],
 "bush": [
  32,
  28
 ],
 "bush_s": [
  16,
  14
 ],
 "butterfly": [
  24,
  20
 ],
 "butterfly_s": [
  12,
  10
 ],
 "campfire": [
  27,
  35
 ],
 "campfire_s": [
  13,
  17
 ],
 "firefly": [
  14,
  16
 ],
 "firefly_s": [
  7,
  8
 ],
 "flower_red": [
  29,
  30
 ],
 "flower_red_s": [
  14,
  15
 ],
 "flower_sun": [
  21,
  34
 ],
 "flower_sun_s": [
  10,
  17
 ],
 "flower_white": [
  30,
  30
 ],
 "flower_white_s": [
  15,
  15
 ],
 "grass0": [
  28,
  30
 ],
 "grass0_s": [
  14,
  15
 ],
 "grass1": [
  27,
  27
 ],
 "grass1_s": [
  13,
  13
 ],
 "item_camelitics": [
  53,
  48
 ],
 "item_classchat": [
  50,
  53
 ],
 "item_fforacle": [
  48,
  53
 ],
 "item_learnwyrm": [
  52,
  53
 ],
 "item_lidartours": [
  50,
  49
 ],
 "item_planit": [
  54,
  46
 ],
 "item_studysync": [
  46,
  52
 ],
 "item_trailblazer": [
  50,
  45
 ],
 "logo_ember": [
  331,
  99
 ],
 "logo_gilded": [
  347,
  146
 ],
 "logo_island": [
  164,
  110
 ],
 "logo_stone": [
  238,
  105
 ],
 "mushroom": [
  20,
  23
 ],
 "mushroom_s": [
  10,
  11
 ],
 "player_idle": [
  41,
  99
 ],
 "player_jump": [
  49,
  110
 ],
 "player_walk0": [
  51,
  99
 ],
 "player_walk1": [
  49,
  99
 ],
 "portrait": [
  74,
  96
 ],
 "sign": [
  32,
  37
 ],
 "sign_s": [
  16,
  18
 ],
 "sky_isl0": [
  42,
  35
 ],
 "sky_isl1": [
  38,
  45
 ],
 "sky_isl2": [
  34,
  25
 ],
 "sky_rock0": [
  13,
  12
 ],
 "sky_rock1": [
  10,
  14
 ],
 "snail": [
  27,
  23
 ],
 "snail_s": [
  13,
  11
 ],
 "squirrel": [
  29,
  27
 ],
 "squirrel_s": [
  14,
  13
 ],
 "tree_oak0": [
  29,
  39
 ],
 "tree_oak0_s": [
  14,
  19
 ],
 "tree_oak1": [
  48,
  56
 ],
 "tree_oak2": [
  67,
  73
 ],
 "tree_pine0": [
  34,
  58
 ],
 "tree_pine1": [
  34,
  71
 ],
 "tree_pine2": [
  29,
  43
 ],
 "tree_pine2_s": [
  14,
  21
 ]
} as const;
export type SpriteName = keyof typeof SPRITES;
export const spriteSrc = (n: SpriteName) => `/game/${n}.png`;
