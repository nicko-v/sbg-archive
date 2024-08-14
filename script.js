window.onTelegramAuth = async (data) => {
  const request = await fetch('/api/link', {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${localStorage.getItem('auth')}`
    }
  })
  const response = await request.json()
  if (request.status !== 200) {
    $('#telegram-login-sbg_game_bot').after($('<div>', { text: i18next.t('telegram.failed'), class: 'tg-error' }).css('color', 'var(--accent)'))
    console.error('Error while linking TG:', response)
  }
  if (response.al) console.warn('Note: Telegram account is already linked')
  $('#telegram-login-sbg_game_bot').after($('<span>', { text: i18next.t('telegram.done') }).css('color', 'var(--progress)'))
  $('#telegram-login-sbg_game_bot, .telegram-auth-button, .tg-error').remove()
}

;(async function main() {
  const is_mobile = isMobile()
  if (!is_mobile) return

  const Packages = [
    'jQuery', 'OpenLayers',
    'Splide.js', 'Toastify.js',
    'i18next'
  ]
  const pkg_avail = [
    typeof $,
    typeof ol,
    typeof i18next,
    typeof Splide,
    typeof Toastify
  ]
  const pkg_fail = pkg_avail.findIndex(f => f === 'undefined')
  if (pkg_fail !== -1) {
    const _text = `Failed to load the ${Packages[pkg_fail]} package. Please try again later.`
    const div = document.createElement('div')
    div.className = 'fatal-error'
    div.innerText = pkg_fail === 2
      ? _text
      : i18next.t('popups.package-fail', { name: Packages[pkg_fail] }) || _text
    document.body.innerHTML = ''
    document.body.style.display = 'grid'
    document.body.append(div)
    return
  }

  initSettings() // это создает настройки
  let is_dark = getSettings('theme') == 'auto'
    ? matchMedia('(prefers-color-scheme: dark)').matches
    : getSettings('theme') == 'dark'

  if (localStorage.getItem('map-config') == null)
    localStorage.setItem('map-config', JSON.stringify({ l: 7, h: 0 }))

  const LANG = getSettings('lang') == 'sys' ? getLanguage() : getSettings('lang')
  const META = await (await fetch('/i18n/meta.json')).json()
  await i18next.use(i18nextChainedBackend).init({
    lng: LANG,
    supportedLngs: META.supported,
    fallbackLng: META.fallbacks,
    backend: {
      backends: [i18nextLocalStorageBackend, i18nextHttpBackend],
      backendOptions: [{ prefix: 'i18next_' }, { loadPath: '/i18n/{{lng}}/main.json?_t=1' }]
    },
    defaultNs: 'main',
    ns: ['main'],
    load: 'languageOnly'
  })

  const LevelTargets = [1500, 5000, 12500, 25000, 60000, 125000, 350000, 675000, 1000000, Infinity]
  const Levels = []
  for (let i = 0; i < LevelTargets.length; i++) {
    const obj = { lv: i + 1, target: LevelTargets[i], total: 0 }
    for (let j = i; j > 0; j--) obj.total += LevelTargets[j - 1]
    Levels.push(obj)
  }
  const ItemTypes = [
    i18next.t('items.unknown'),
    i18next.t('items.types.core'),
    i18next.t('items.types.catalyser'),
    i18next.t('items.types.reference'),
    i18next.t('items.types.broom'),
  ]
  const Cores = [
    { lv: 0, eng: 0, lim: 0 }, { lv: 1, eng: 500, lim: 6 },
    { lv: 2, eng: 750, lim: 6 }, { lv: 3, eng: 1000, lim: 4 },
    { lv: 4, eng: 1500, lim: 4 }, { lv: 5, eng: 2000, lim: 3 },
    { lv: 6, eng: 2500, lim: 3 }, { lv: 7, eng: 3500, lim: 2 },
    { lv: 8, eng: 4000, lim: 2 }, { lv: 9, eng: 5250, lim: 1 },
    { lv: 10, eng: 6500, lim: 1 }
  ]
  const Catalysers = [
    { lv: 0, range: 0 }, { lv: 1, range: 42 }, { lv: 2, range: 48 },
    { lv: 3, range: 58 }, { lv: 4, range: 72 }, { lv: 5, range: 90 },
    { lv: 6, range: 112 }, { lv: 7, range: 138 }, { lv: 8, range: 164 },
    { lv: 9, range: 186 }, { lv: 10, range: 214 }
  ]
  const TeamColors = [
    {
      fill: () => is_dark || getSettings('base') == 'goo' ? '#AAAAAA80' : '#44444480',
      stroke: () => is_dark || getSettings('base') == 'goo' ? '#AAA' : '#444'
    },
    { fill: '#BB000080', stroke: '#B00' },
    { fill: '#00BB0080', stroke: '#0B0' },
    { fill: '#0088FF80', stroke: '#08F' }
  ]
  const LevelColors = ['#FECE5A', '#FFA630', '#FF7315', '#E40000', '#FD2992', '#EB26CD', '#C124E0', '#9627F4', '#6D00F5', '#3A00F7']
  const LightStrokes = ['', '#80F', '#80F', '#F80', '#F80']

  const G2T = [[], [1], [2, 4], [3]]
  const LINES_LIMIT_OUT = 30
  const INVENTORY_LIMIT = 3000
  const COOLDOWN = 90
  const BURNOUT = 3600
  const SERIES = 5

  jqueryI18next.init(i18next, $, { useOptionsAttr: true })
  $('html').attr('lang', LANG)
  $('body').localize()
  $('title').text(i18next.t('title'))

  let self_data
  let VERSION
  {
    const { request, response } = await apiQuery('self').catch(({ toast }) => apiCatch(toast))
    if (!response) return
    self_data = response
    VERSION = request.headers.get('SBG-Version')
  }

  updateSelfInfo()
  initSettings() // это применяет настройки

  apiQuery('inventory')
    .catch(({ toast }) => apiCatch(toast))
    .then(({ response }) => {
      localStorage.setItem('inventory-cache', JSON.stringify(response.i))
      const total = response.i.map(m => m.a).reduce((acc, e) => acc += e, 0)
      $('#self-info__inv').text(total)
        .parent().css('color', total >= INVENTORY_LIMIT ? 'var(--accent)' : '')
      $('#self-info__inv-lim').text(INVENTORY_LIMIT)
    })

  apiQuery('notifs', { latest: +localStorage.getItem('latest-notif') })
    .catch(({ toast }) => apiCatch(toast))
    .then(({ response }) => {
      if (response.count > 0) $('#notifs-menu').attr('data-count', response.count)
    })
  setInterval(() => {
    apiQuery('notifs', { latest: +localStorage.getItem('latest-notif') })
    .catch(({ toast }) => apiCatch(toast))
    .then(({ response }) => {
      if (response.count > 0) $('#notifs-menu').attr('data-count', response.count)
    })
  }, 60e3)

  fetch('/assets/rarities.svg').then(r => r.text().then(xml => $('body').append(xml)))

  const player_feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([0, 0]))
  })
  const player_styles = [new ol.style.Style({
    image: new ol.style.Icon({
      src: `/assets/player/${self_data.t}.svg`
    })
  }), new ol.style.Style({ // range
    geometry: new ol.geom.Circle(ol.proj.fromLonLat([0, 0]), toOLMeters(45, 1)),
    stroke: new ol.style.Stroke({ color: '#F80', width: 2 })
  }), new ol.style.Style({ // blast range
    geometry: new ol.geom.Circle(ol.proj.fromLonLat([0, 0]), 0),
    stroke: new ol.style.Stroke({ color: '#F000', width: 2 })
  })]
  player_feature.setStyle(player_styles)

  const player_source = new ol.source.Vector({ features: [player_feature] })
  const player_layer = new ol.layer.Vector({ source: player_source, name: 'player', className: 'ol-layer__player', zIndex: 4 })

  const points_source = new ol.source.Vector()
  const points_layer = new ol.layer.Vector({ source: points_source, name: 'points', className: 'ol-layer__points', zIndex: 3 })

  const lines_source = new ol.source.Vector()
  const temp_lines_source = new ol.source.Vector()
  const lines_layer = new ol.layer.Vector({ source: lines_source, name: 'lines', className: 'ol-layer__lines', zIndex: 2 })
  const temp_lines_layer = new ol.layer.Vector({ source: temp_lines_source, name: 'lines', className: 'ol-layer__lines', zIndex: 2 })

  const regions_source = new ol.source.Vector()
  const regions_layer = new ol.layer.Vector({ source: regions_source, name: 'regions', className: 'ol-layer__regions', zIndex: 1 })

  const FeatureStyles = {
    POINT: (pos, team, energy, light) => new ol.style.Style({
      geometry: new ol.geom.Circle(pos, 12),
      renderer: (coords, state) => {
        const ctx = state.context
        const [[xc, yc], [xe, ye]] = coords
        const radius = Math.sqrt((xe - xc) ** 2 + (ye - yc) ** 2)

        ctx.lineWidth = is_mobile ? 6 : 2
        ctx.strokeStyle = team == 0 ? TeamColors[0].stroke() : TeamColors[team].stroke
        ctx.fillStyle = team == 0 ? TeamColors[0].fill() : TeamColors[team].fill
        if (energy) {
          ctx.beginPath()
          ctx.arc(xc, yc, radius, ...calculateAngle(energy))
          ctx.lineTo(xc, yc)
          ctx.fill()

          ctx.fillStyle = TeamColors[0].fill()
          ctx.beginPath()
          ctx.arc(xc, yc, radius, ...calculateAngle(1 - energy, energy))
          ctx.lineTo(xc, yc)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(xc, yc, radius, 0, 2 * Math.PI)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(xc, yc, radius, 0, 2 * Math.PI)
        ctx.stroke()

        const h = JSON.parse(localStorage.getItem('map-config')).h
        if (h == 0) return
        const offset = is_mobile ? 12 : 4
        ctx.lineWidth = is_mobile ? 6 : 3
        if (typeof light === 'boolean' && light) {
          ctx.strokeStyle = LightStrokes[h]
          ctx.beginPath()
          ctx.arc(xc, yc, radius + offset, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (typeof light === 'number') {
          ctx.beginPath()
          ctx.strokeStyle = LevelColors[light - 1]
          ctx.arc(xc, yc, radius + offset, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }
    }),
    TEXT: (text) => new ol.style.Style({
      text: new ol.style.Text({
        font: '14px Manrope',
        offsetY: -15,
        text,
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({ color: '#FFF', width: 3 })
      }),
      zIndex: 2
    })
  }

  // EPSG:4326 - common
  // EPSG:3857 - webmercator
  const base_layer = new ol.layer.Tile({ className: 'ol-layer__base' })
  setBaselayer('osm')
  const view = new ol.View({
    center: [0, 0],
    zoom: 17,
    minZoom: 1,
    maxZoom: 20,
    constrainResolution: true
  })
  const ViewOffsets = {
    NORMAL: 165,
    CENTER: -10
  }
  view.setProperties({ offset: [0, ViewOffsets.NORMAL] })
  const map = new ol.Map({
    target: 'map',
    layers: [base_layer, regions_layer, lines_layer, temp_lines_layer, points_layer, player_layer],
    view,
    controls: ol.control.defaults.defaults().extend([new ol.control.ScaleLine()])
  })
  map.setProperties({ ignore_follow: false, is_first_watched: false })
  map.once('rendercomplete', () => {
    setBaselayer()
    $('.ol-layer__base').attr('data-code', getSettings('base'))
    if (getSettings('plrhid') == true) $('.ol-layer__player').addClass('hidden')
  })
  // const ViewOffsets2 = {
  //   _HALF: () => { const val = view.getResolution() * (map.viewport_.clientHeight / 2); console.log(val); return val },
  //   NORMAL: () => ViewOffsets2._HALF() * 2/3,
  //   CENTER: () => ViewOffsets2._HALF() * -1/20
  // }
  // view.setProperties({ offset: [0, ViewOffsets2.NORMAL()] })

  const request_controllers = {
    entities: new AbortController(),
    points: new AbortController()
  }

  ;(async function handleURLLinks() {
    const params = new URLSearchParams(location.search)
    history.replaceState({}, '', location.pathname)
    if (params.has('point')) {
      const guid = params.get('point')
      if (!guid.match(/^[a-z\d]{12}\.22a$/)) return
      map.setProperties({ ignore_follow: true })
      const { response } = await apiQuery('point', { guid }).catch(({ toast }) => apiCatch(toast))
      $('#toggle-follow').attr('data-active', false)
      localStorage.setItem('follow', false)
      view.setCenter(ol.proj.fromLonLat(response.data.c))
      showInfo(response.data)
    } else if (params.has('player')) {
      const query = params.get('player')
      if (!query.match(/^[a-z\d<>]+$/i)) return
      openProfile(query)
    }
  })();

  let count_regions = false
  map.on('click', e => {
    const piv = []
    const regions = [0, 0, 0]
    map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      const name = layer.get('name')
      if (name === 'points') piv.push(feature.getId())
      if (name === 'regions' && count_regions) regions[feature.getProperties().team - 1]++
    })
    if (count_regions) createToast(String.prototype.concat(
        i18next.t('popups.pick-regions.result'), '<br>',
        i18next.t('score.red'), `: ${regions[0]}; `,
        i18next.t('score.green'), `: ${regions[1]}; `,
        i18next.t('score.blue'), `: ${regions[2]}`
    ), null, 'top right').showToast()
    if (piv.length) showInfo(piv[0])
  })

  const prev_pos = {
    center: view.getCenter(),
    zoom: view.getZoom(),
    rotation: view.getRotation()
  }
  map.on('moveend', () => {
    const angle = player_styles[0].getImage().getRotation()
    player_styles[0].getImage().setRotation(angle + (view.getRotation() - prev_pos.rotation))
    player_feature.changed()
    prev_pos.rotation = view.getRotation()
    player_styles[1].getGeometry().setRadius(toOLMeters(45))

    const zoom = view.getZoom()
    const offset = new ol.geom.LineString([prev_pos.center, view.getCenter()])
    if (ol.sphere.getLength(offset) <= 30 && prev_pos.zoom === zoom) return
    prev_pos.center = view.getCenter()
    prev_pos.zoom = zoom
    requestEntities()
  })
  setInterval(requestEntities, 5 * 60 * 1000)

  let watcher
  if ('geolocation' in navigator) {
    watcher = navigator.geolocation.watchPosition(({ coords }) => {
      movePlayer([coords.longitude, coords.latitude])
      $('#toggle-follow').attr('data-active', localStorage.getItem('follow') !== 'false')
      if (!map.getProperties().is_first_watched) {
        map.setProperties({ is_first_watched: true })
        $('#toggle-follow').prop('disabled', false)
      }
    }, error => {
      console.error('Geolocation API got an error:', error)
      if (error.code == 1) {
        $('body').empty().css({ display: 'grid' }).append($('<div>', {
          class: 'fatal-error',
          text: i18next.t('popups.gps.denied')
        }))
      } else if (error.code == 2) {
        if (isMobile()) {
          $('body').empty().css({ display: 'grid' }).append($('<div>', {
            class: 'fatal-error',
            text: i18next.t('popups.gps.fail')
          }))
        } else {
          player_source.clear()
          $('#self-info__coord').parent().remove()
          $('#toggle-follow').remove()
        }
      } else {
        const toast = createToast(i18next.t('popups.gps.generic', { code: error.code }))
        toast.options.className = 'error-toast'
        toast.showToast()
      }
    }, {
      enableHighAccuracy: true,
      maximumAge: 0
    })
  } else {
    $('body').empty().css({ display: 'grid' }).append($('<div>', {
      class: 'fatal-error',
      text: i18next.t('popups.gps.unavailable')
    }))
  }

  const timers = {
    info_controls: null, info_cooldown: null,
    player_xpup: null, attack_ring: null,
    score: null,
    damage_texts: []
  }
  const point_state = {
    info: {},
    possible_lines: []
  }
  const popup_toasts = []

  const slider_config = {
    drag: 'free', snap: true, perPage: 3, pagination: false, wheel: true,
    direction: 'ltr', height: 100, gap: '.5em', focus: 'center', trimSpace: false
  }
  const attack_slider = new Splide('#attack-slider', slider_config)
  attack_slider.on('click', event => {
    if (attack_slider.index == event.index) return
    attack_slider.go(event.index)
  })
  attack_slider.on('move drag scroll', () => $('#attack-slider-fire').prop('disabled', true))
  attack_slider.on('moved dragged scrolled', () => {
    attack_slider.emit('active', { slide: $(attack_slider.root).find('.splide__slide.is-active') })
  })
  attack_slider.on('active', event => {
    const inventory = JSON.parse(localStorage.getItem('inventory-cache')) || []
    const catalyser = inventory.find(f => f.g == $(event.slide).attr('data-guid'))
    const highlevel = catalyser.l > self_data.l
    $('#attack-slider-fire').prop('disabled', highlevel)
    $('.attack-slider-highlevel').css('color', highlevel ? '#F00' : '#0000')
  })
  attack_slider.mount()

  const deploy_slider = new Splide('#deploy-slider', slider_config)
  deploy_slider.on('click', event => {
    if (deploy_slider.index == event.index) return
    deploy_slider.go(event.index)
  })
  deploy_slide