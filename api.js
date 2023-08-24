/* DEPLOY */
// POST /api/deploy
{
  // REQUEST:
  body == {
    "guid": "000000000000.22a",
    "core": "000000000000.67f",
    "position": [37.000000, 55.000000]
  }

  // RESPONSE:
  // Успешный деплой:
  body == {
    "data": {
      "g": "000000000000.22a",
      "t": "Point title",
      "i": "RgfUtBVLNYoBTj3JGC0UpENV_J5_yN-eN24O7HqGKet-NXg-rRlwJ9nKWXI9h-PQseB_Vpouc2NZDsm-D2bGmKI_pV8h",
      "c": [
        37.000000,
        55.000000
      ],
      "o": "Nickname",
      "te": 3,
      "l": 2,
      "co": [
        {
          "g": "000000000000.1a9",
          "l": 10,
          "e": 6500,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 9,
          "e": 5250,
          "o": "Nickname"
        }
      ],
      "e": 100
    },
    "xp": {
      "cur": 99999,
      "diff": 125
    }
  }
  // Превышен лимит для этого уровня ядра:
  body == {
    "error": "Core limit for this level is exceeded"
  }
  // Нет свободных слотов:
  body == {
    "error": "Point is fully deployed"
  }
  // Точка вне радиуса:
  body == {
    "error": "Point is out of range"
  }
  // Точка принадлежит другой команде:
  body == {
    "error": "Point is onwed by enemy"
  }
}


/* DISCOVER */
// POST /api/discover
{
  // REQUEST:
  body == {
    "position": [37.000000, 55.000000],
    "guid": "000000000000.22a"
  }

  // RESPONSE:
  // Не последний дискавер:
  body == {
    "loot": [
      {
        "g": "000000000000.67f",
        "t": 1,
        "l": 5,
        "a": 1
      },
      {
        "g": "000000000000.67f",
        "t": 2,
        "l": 7,
        "a": 1
      },
      {
        "g": "000000000000.67f",
        "t": 3,
        "l": "000000000000.22a",
        "ti": "Point title",
        "c": [
          37.000000,
          55.000000
        ],
        "a": 1
      }
    ],
    "burnout": 2,
    "xp": {
      "cur": 999999,
      "diff": 42
    }
  }
  // Последний дискавер. Выжигание:
  body == {
    "loot": [
      {
        "g": "000000000000.67f",
        "t": 1,
        "l": 5,
        "a": 4
      },
      {
        "g": "000000000000.67f",
        "t": 2,
        "l": 6,
        "a": 2
      },
      {
        "g": "000000000000.67f",
        "t": 3,
        "l": "000000000000.22a",
        "ti": "Point title",
        "c": [
          37.000000,
          55.000000
        ],
        "a": 1
      }
    ],
    "burnout": 1688621730634,
    "xp": {
      "cur": 999999,
      "diff": 42
    }
  }
  // Активный таймаут между дискаверами:
  body == {
    "error": "Изучение невозможно. Попробуйте снова через 23 секунды.",
    "cooldown": 23
  }
  // Точка вне радиуса:
  body == {
    "error": "Point is out of range"
  }
}


/* REPAIR */
// POST /api/repair
{
  // REQUEST:
  body == {
    "guid": "000000000000.22a",
    "position": [37.000000, 55.000000]
  }

  // RESPONSE:
  // Успешная починка:
  body == {
    "data": {
      "g": "000000000000.22a",
      "t": "Point title",
      "i": "RgfUtBVLNYoBTj3JGC0UpENV_J5_yN-eN24O7HqGKet-NXg-rRlwJ9nKWXI9h-PQseB_Vpouc2NZDsm-D2bGmKI_pV8h",
      "c": [
        37.000000,
        55.000000
      ],
      "o": "Nickname",
      "te": 3,
      "l": 9,
      "co": [
        {
          "g": "000000000000.1a9",
          "l": 9,
          "e": 5250,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 8,
          "e": 4000,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 9,
          "e": 5250,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 8,
          "e": 4000,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 10,
          "e": 6500,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 10,
          "e": 6500,
          "o": "Nickname"
        }
      ]
    },
    "xp": {
      "cur": 999999,
      "diff": 0
    }
  }
  // Точка полностью починена:
  body == {
    "error": "Point is fully repaired"
  }
  // Точка вне радиуса:
  body == {
    "error": "Point is out of range"
  }
  // Точка принадлежит другой команде:
  body == {
    "error": "Point is onwed by enemy"
  }
}


/* DRAW */
// GET /api/draw
{
  // REQUEST:
  params == '?guid=000000000000.22a & position[]=37.00000000000000 & position[]=55.000000000000000 & exref=true'

  // RESPONSE:
  // Есть доступные точки:
  body == {
    "data": [
      {
        "r": "000000000000.67f",
        "a": 19,
        "p": "000000000000.22a",
        "t": "Point title",
        "i": "RgfUtBVLNYoBTj3JGC0UpENV_J5_yN-eN24O7HqGKet-NXg-rRlwJ9nKWXI9h-PQseB_Vpouc2NZDsm-D2bGmKI_pV8h",
        "g": [
          [
            37.000000,
            55.000000
          ],
          [
            37.000000,
            55.000000
          ]
        ],
        "d": 42.00000000
      }
    ]
  }
  // Нет доступных точек:
  body == {
    "data": []
  }
  // Точка вне радиуса:
  body == {
    "error": "Point is out of range"
  }
  // Точка не полностью проставлена:
  body == {
    "error": "Point is not fully deployed"
  }
  // Точка нейтральна:
  body == {
    "error": "Point is neutral"
  }
  // Точка принадлежит другой команде:
  body == {
    "error": "Point is onwed by enemy"
  }
}

// POST /api/draw
{
  // REQUEST:
  body == {
    "from": "000000000000.22a",
    "to": "000000000000.22a",
    "position": [37.000000, 55.000000]
  }

  // RESPONSE:
  // Успешное рисование:
  body == {
    "xp": {
      "cur": 999999,
      "diff": 80
    },
    "ref": {
      "g": "000000000000.67f",
      "a": 2
    },
    "line": {
      "g": "000000000000.1a8",
      "c": [
        [
          37.000000,
          55.000000
        ],
        [
          37.000000,
          55.000000
        ]
      ]
    }
  }
  // Превышен лимит исходящих линий:
  body == {
    "error": "Outbound lines limit is reached"
  }
  // Отсутствует реф целевой точки:
  body == {
    "error": "No reference to the target point"
  }
  // Точка вне радиуса:
  body == {
    "error": "Point is out of range"
  }
  // Точка не полностью проставлена:
  body == {
    "error": "Point is not fully deployed"
  }
  // Точка нейтральна:
  body == {
    "error": "Point is neutral"
  }
  // Точка принадлежит другой команде:
  body == {
    "error": "Point is onwed by enemy"
  }
}


/* INVIEW */
// GET /api/inview
{
  // REQUEST:
  params == '?sw=37.00000000000000%2C55.00000000000000 & ne=37.00000000000000%2C55.00000000000000 & z=17 & l=7 & h=0'
  // l - комбинация отображаемых объектов: точек, линий, регионов, игрока.
  // h - подсветка точки: 0...5 (нет, посещена, не посещена, захвачена, не захвачена, уровень).

  // RESPONSE:
  // Есть точки и линии:
  body == {
    "l": [
      {
        "g": "000000000000.1a8",
        "c": [
          [
            37.000000,
            55.000000
          ],
          [
            37.000000,
            55.000000
          ]
        ],
        "t": 1
      },
    ],
    "p": [
      {
        "g": "000000000000.22a",
        "c": [
          37.000000,
          55.000000
        ],
        "t": 1,
        "e": 0.420,
        "h": false
      },
    ],
    "r": [
      {
        "g": "000000000000.308",
        "c": [
          [
            [
              39.000000,
              64.000000
            ],
            [
              40.000000,
              64.000000
            ],
            [
              -81.000000,
              23.000000
            ],
            [
              39.000000,
              64.000000
            ]
          ]
        ],
        "t": 2
      },
    ]
  }
  // Нет ничего:
  body == {
    "l": [],
    "p": [],
    "r": []
  }
}


/* POINT */
// GET /api/point
{
  // REQUEST:
  params == '?guid=000000000000.22a'
  params == '?guid=000000000000.22a & status=1'

  // RESPONSE:
  // Полная информация:
  body == {
    "data": {
      "g": "000000000000.22a",
      "t": "Point title",
      "i": "RgfUtBVLNYoBTj3JGC0UpENV_J5_yN-eN24O7HqGKet-NXg-rRlwJ9nKWXI9h-PQseB_Vpouc2NZDsm-D2bGmKI_pV8h",
      "c": [
        37.000000,
        55.000000
      ],
      "o": "Nickname", // | "n/a"
      "te": 3, // 0...3
      "l": 7,
      "li": {
        "o": 0,
        "i": 20
      },
      "u": {
        "v": true,
        "c": true
      },
      "co": [
        {
          "g": "000000000000.1a9",
          "l": 10,
          "e": 6461,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 7,
          "e": 3479,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 7,
          "e": 3479,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 6,
          "e": 2485,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 8,
          "e": 3976,
          "o": "Nickname"
        },
        {
          "g": "000000000000.1a9",
          "l": 9,
          "e": 5219,
          "o": "Nickname"
        }
      ]
    }
  }
  // Сокращённая информация (status=1):
  body == {
    "data": {
      "g": "000000000000.22a",
      "t": "Point title",
      "c": [
        37.000000,
        55.000000
      ],
      "o": "Nickname", // | null
      "te": "Nickname", // 1...3 | null
      "l": 1,
      "co": 6,
      "e": 42.2,
      "li": {
        "o": 1,
        "i": 0
      },
      "u": {
        "v": true,
        "c": true
      }
    }
  }
}


/* PROFILE */
// GET /api/profile
{
  // REQUEST:
  params == '?guid=000000000000.28d'
  params == '?name=Nickname'

  // RESPONSE:
  body == {
    "data": {
      "name": "Nickname",
      "team": 3,
      "created_at": "2023-02-02T08:23:12.026Z",
      "player": "000000000000.28d",
      "xp": 999999,
      "level": 10,
      "captures": 42,
      "discoveries": 42,
      "neutralizes": 42,
      "cores_deployed": 42,
      "cores_destroyed": 42,
      "guard_point": 42,
      "lines": 42,
      "max_line": 42,
      "guard_line": 42,
      "lines_destroyed": 42,
      "owned_points": 42,
      "unique_visits": 42,
      "unique_captures": 42
    }
  }
}


/* INVENTORY */
// GET /api/inventory
{
  // REQUEST:
  params == ''

  // RESPONSE:
  body == {
    "i": [
      {
        "g": "000000000000.67f",
        "t": 1,
        "l": 5,
        "a": 42
      },
      {
        "g": "000000000000.67f",
        "t": 2,
        "l": 5,
        "a": 42
      },
      {
        "g": "000000000000.67f",
        "t": 3,
        "l": "000000000000.22a",
        "ti": "Point title",
        "c": [
          37.000000,
          55.000000
        ],
        "a": 42
      }
    ]
  }
}

// DELETE /api/inventory
{
  // REQUEST:
  // Удаление одного предмета:
  body == {
    "selection": {
      "000000000000.67f": 1
    },
    "tab": 1
  }
  // Удаление пачками:
  body == {
    "selection": ["000000000000.67f"],
    "tab": 1
  }

  // RESPONSE:
  // Удаление одного предмета:
  body == {
    "count": {
      "1": 761, // Количество этого типа
      "item": 23, // Количество этого предмета
      "total": 2414
    }
  }
  // Удаление пачками:
  body == {
    "count": {
      "1": 738,
      "total": 2391
    }
  }
}


/* SCORE */
// GET /api/score
{
  // REQUEST:
  params == ''

  // RESPONSE:
  body == {
    "score": [
      {
        "check": "2023-08-24T05:00:00.000Z",
        "r": 7317,
        "g": 20990,
        "b": 18852
      },
      {
        "check": "2023-08-24T05:00:00.000Z",
        "r": 113399.97293875372,
        "g": 471829.56464609696,
        "b": 33222.769905500325
      }
    ],
    "diffs": [
      {
        "r": -43,
        "g": 30,
        "b": 238
      },
      {
        "r": 0.15151218402024824,
        "g": -11.187484299531206,
        "b": 2.4339607163710753
      }
    ]
  }
}


/* NOTIFICATIONS */
// GET /api/notifs
{
  // REQUEST:
  params == ''
  params == 'latest=00000' //

  // RESPONSE:
  // Все отбивки:
  body == {
    "list": [
      {
        "id": 20930,
        "na": "Nickname",
        "ta": 2, // Team.
        "g": "000000000000.22a",
        "t": "Point title",
        "c": [
          37.000000,
          55.000000
        ],
        "ti": "2023-08-24T04:24:26.165Z"
      },
    ]
  }
  // Количество отбивок после указанного id:
  body == {
    "count": 42
  }
}