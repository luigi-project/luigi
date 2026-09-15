//#region \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), (e = null)), t.exports),
  t = class {
    $value;
    $subscribers = /* @__PURE__ */ new Set();
    constructor(e) {
      this.$value = e;
    }
    set(e) {
      ((this.$value = e),
        this.$subscribers.forEach((t) => {
          t(e);
        }));
    }
    update(e) {
      this.set(e(this.$value));
    }
    subscribe(e) {
      return (
        this.$subscribers.add(e),
        e(this.$value),
        () => {
          this.$subscribers.delete(e);
        }
      );
    }
  };
function n(e) {
  return e.$value;
}
function r(e) {
  return new t(e);
}
//#endregion
//#region src/utilities/helpers/generic-helpers.ts
var i = /* @__PURE__ */ e((e, t) => {
    (function () {
      var n,
        r = '4.18.1',
        i = 200,
        a = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
        o = 'Expected a function',
        s = 'Invalid `variable` option passed into `_.template`',
        c = 'Invalid `imports` option passed into `_.template`',
        l = '__lodash_hash_undefined__',
        u = 500,
        d = '__lodash_placeholder__',
        f = 1,
        p = 2,
        m = 4,
        h = 1,
        g = 2,
        _ = 1,
        v = 2,
        y = 4,
        b = 8,
        x = 16,
        S = 32,
        C = 64,
        ee = 128,
        te = 256,
        ne = 512,
        re = 30,
        ie = '...',
        ae = 800,
        oe = 16,
        se = 1,
        ce = 2,
        le = 3,
        ue = Infinity,
        de = 9007199254740991,
        fe = 17976931348623157e292,
        pe = NaN,
        me = 4294967295,
        he = me - 1,
        ge = me >>> 1,
        _e = [
          ['ary', ee],
          ['bind', _],
          ['bindKey', v],
          ['curry', b],
          ['curryRight', x],
          ['flip', ne],
          ['partial', S],
          ['partialRight', C],
          ['rearg', te]
        ],
        ve = '[object Arguments]',
        ye = '[object Array]',
        be = '[object AsyncFunction]',
        xe = '[object Boolean]',
        Se = '[object Date]',
        Ce = '[object DOMException]',
        we = '[object Error]',
        Te = '[object Function]',
        Ee = '[object GeneratorFunction]',
        De = '[object Map]',
        Oe = '[object Number]',
        ke = '[object Null]',
        Ae = '[object Object]',
        je = '[object Promise]',
        Me = '[object Proxy]',
        Ne = '[object RegExp]',
        Pe = '[object Set]',
        Fe = '[object String]',
        Ie = '[object Symbol]',
        Le = '[object Undefined]',
        Re = '[object WeakMap]',
        ze = '[object WeakSet]',
        Be = '[object ArrayBuffer]',
        w = '[object DataView]',
        Ve = '[object Float32Array]',
        He = '[object Float64Array]',
        Ue = '[object Int8Array]',
        We = '[object Int16Array]',
        Ge = '[object Int32Array]',
        Ke = '[object Uint8Array]',
        qe = '[object Uint8ClampedArray]',
        Je = '[object Uint16Array]',
        Ye = '[object Uint32Array]',
        Xe = /\b__p \+= '';/g,
        T = /\b(__p \+=) '' \+/g,
        Ze = /(__e\(.*?\)|\b__t\)) \+\n'';/g,
        Qe = /&(?:amp|lt|gt|quot|#39);/g,
        $e = /[&<>"']/g,
        et = RegExp(Qe.source),
        tt = RegExp($e.source),
        nt = /<%-([\s\S]+?)%>/g,
        rt = /<%([\s\S]+?)%>/g,
        it = /<%=([\s\S]+?)%>/g,
        at = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        ot = /^\w*$/,
        st = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
        ct = /[\\^$.*+?()[\]{}|]/g,
        lt = RegExp(ct.source),
        ut = /^\s+/,
        E = /\s/,
        dt = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
        ft = /\{\n\/\* \[wrapped with (.+)\] \*/,
        pt = /,? & /,
        mt = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,
        ht = /[()=,{}\[\]\/\s]/,
        gt = /\\(\\)?/g,
        _t = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,
        vt = /\w*$/,
        D = /^[-+]0x[0-9a-f]+$/i,
        yt = /^0b[01]+$/i,
        bt = /^\[object .+?Constructor\]$/,
        xt = /^0o[0-7]+$/i,
        St = /^(?:0|[1-9]\d*)$/,
        Ct = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,
        wt = /($^)/,
        Tt = /['\n\r\u2028\u2029\\]/g,
        Et = '\\ud800-\\udfff',
        Dt = '\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff',
        Ot = '\\u2700-\\u27bf',
        O = 'a-z\\xdf-\\xf6\\xf8-\\xff',
        k = '\\xac\\xb1\\xd7\\xf7',
        kt = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
        At = '\\u2000-\\u206f',
        jt =
          ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
        Mt = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
        Nt = '\\ufe0e\\ufe0f',
        Pt = k + kt + At + jt,
        Ft = "['’]",
        A = '[' + Et + ']',
        It = '[' + Pt + ']',
        Lt = '[' + Dt + ']',
        Rt = '\\d+',
        zt = '[' + Ot + ']',
        Bt = '[' + O + ']',
        Vt = '[^' + Et + Pt + Rt + Ot + O + Mt + ']',
        Ht = '\\ud83c[\\udffb-\\udfff]',
        Ut = '(?:' + Lt + '|' + Ht + ')',
        Wt = '[^' + Et + ']',
        Gt = '(?:\\ud83c[\\udde6-\\uddff]){2}',
        Kt = '[\\ud800-\\udbff][\\udc00-\\udfff]',
        qt = '[' + Mt + ']',
        Jt = '\\u200d',
        Yt = '(?:' + Bt + '|' + Vt + ')',
        Xt = '(?:' + qt + '|' + Vt + ')',
        Zt = '(?:' + Ft + '(?:d|ll|m|re|s|t|ve))?',
        Qt = '(?:' + Ft + '(?:D|LL|M|RE|S|T|VE))?',
        $t = Ut + '?',
        en = '[' + Nt + ']?',
        tn = '(?:' + Jt + '(?:' + [Wt, Gt, Kt].join('|') + ')' + en + $t + ')*',
        nn = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
        rn = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
        an = en + $t + tn,
        on = '(?:' + [zt, Gt, Kt].join('|') + ')' + an,
        sn = '(?:' + [Wt + Lt + '?', Lt, Gt, Kt, A].join('|') + ')',
        cn = RegExp(Ft, 'g'),
        ln = RegExp(Lt, 'g'),
        un = RegExp(Ht + '(?=' + Ht + ')|' + sn + an, 'g'),
        dn = RegExp(
          [
            qt + '?' + Bt + '+' + Zt + '(?=' + [It, qt, '$'].join('|') + ')',
            Xt + '+' + Qt + '(?=' + [It, qt + Yt, '$'].join('|') + ')',
            qt + '?' + Yt + '+' + Zt,
            qt + '+' + Qt,
            rn,
            nn,
            Rt,
            on
          ].join('|'),
          'g'
        ),
        fn = RegExp('[' + Jt + Et + Dt + Nt + ']'),
        pn = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
        mn =
          /* @__PURE__ */ 'Array.Buffer.DataView.Date.Error.Float32Array.Float64Array.Function.Int8Array.Int16Array.Int32Array.Map.Math.Object.Promise.RegExp.Set.String.Symbol.TypeError.Uint8Array.Uint8ClampedArray.Uint16Array.Uint32Array.WeakMap._.clearTimeout.isFinite.parseInt.setTimeout'.split(
            '.'
          ),
        hn = -1,
        j = {};
      ((j[Ve] = j[He] = j[Ue] = j[We] = j[Ge] = j[Ke] = j[qe] = j[Je] = j[Ye] = !0),
        (j[ve] =
          j[ye] =
          j[Be] =
          j[xe] =
          j[w] =
          j[Se] =
          j[we] =
          j[Te] =
          j[De] =
          j[Oe] =
          j[Ae] =
          j[Ne] =
          j[Pe] =
          j[Fe] =
          j[Re] =
            !1));
      var M = {};
      ((M[ve] =
        M[ye] =
        M[Be] =
        M[w] =
        M[xe] =
        M[Se] =
        M[Ve] =
        M[He] =
        M[Ue] =
        M[We] =
        M[Ge] =
        M[De] =
        M[Oe] =
        M[Ae] =
        M[Ne] =
        M[Pe] =
        M[Fe] =
        M[Ie] =
        M[Ke] =
        M[qe] =
        M[Je] =
        M[Ye] =
          !0),
        (M[we] = M[Te] = M[Re] = !1));
      var gn = {
          À: 'A',
          Á: 'A',
          Â: 'A',
          Ã: 'A',
          Ä: 'A',
          Å: 'A',
          à: 'a',
          á: 'a',
          â: 'a',
          ã: 'a',
          ä: 'a',
          å: 'a',
          Ç: 'C',
          ç: 'c',
          Ð: 'D',
          ð: 'd',
          È: 'E',
          É: 'E',
          Ê: 'E',
          Ë: 'E',
          è: 'e',
          é: 'e',
          ê: 'e',
          ë: 'e',
          Ì: 'I',
          Í: 'I',
          Î: 'I',
          Ï: 'I',
          ì: 'i',
          í: 'i',
          î: 'i',
          ï: 'i',
          Ñ: 'N',
          ñ: 'n',
          Ò: 'O',
          Ó: 'O',
          Ô: 'O',
          Õ: 'O',
          Ö: 'O',
          Ø: 'O',
          ò: 'o',
          ó: 'o',
          ô: 'o',
          õ: 'o',
          ö: 'o',
          ø: 'o',
          Ù: 'U',
          Ú: 'U',
          Û: 'U',
          Ü: 'U',
          ù: 'u',
          ú: 'u',
          û: 'u',
          ü: 'u',
          Ý: 'Y',
          ý: 'y',
          ÿ: 'y',
          Æ: 'Ae',
          æ: 'ae',
          Þ: 'Th',
          þ: 'th',
          ß: 'ss',
          Ā: 'A',
          Ă: 'A',
          Ą: 'A',
          ā: 'a',
          ă: 'a',
          ą: 'a',
          Ć: 'C',
          Ĉ: 'C',
          Ċ: 'C',
          Č: 'C',
          ć: 'c',
          ĉ: 'c',
          ċ: 'c',
          č: 'c',
          Ď: 'D',
          Đ: 'D',
          ď: 'd',
          đ: 'd',
          Ē: 'E',
          Ĕ: 'E',
          Ė: 'E',
          Ę: 'E',
          Ě: 'E',
          ē: 'e',
          ĕ: 'e',
          ė: 'e',
          ę: 'e',
          ě: 'e',
          Ĝ: 'G',
          Ğ: 'G',
          Ġ: 'G',
          Ģ: 'G',
          ĝ: 'g',
          ğ: 'g',
          ġ: 'g',
          ģ: 'g',
          Ĥ: 'H',
          Ħ: 'H',
          ĥ: 'h',
          ħ: 'h',
          Ĩ: 'I',
          Ī: 'I',
          Ĭ: 'I',
          Į: 'I',
          İ: 'I',
          ĩ: 'i',
          ī: 'i',
          ĭ: 'i',
          į: 'i',
          ı: 'i',
          Ĵ: 'J',
          ĵ: 'j',
          Ķ: 'K',
          ķ: 'k',
          ĸ: 'k',
          Ĺ: 'L',
          Ļ: 'L',
          Ľ: 'L',
          Ŀ: 'L',
          Ł: 'L',
          ĺ: 'l',
          ļ: 'l',
          ľ: 'l',
          ŀ: 'l',
          ł: 'l',
          Ń: 'N',
          Ņ: 'N',
          Ň: 'N',
          Ŋ: 'N',
          ń: 'n',
          ņ: 'n',
          ň: 'n',
          ŋ: 'n',
          Ō: 'O',
          Ŏ: 'O',
          Ő: 'O',
          ō: 'o',
          ŏ: 'o',
          ő: 'o',
          Ŕ: 'R',
          Ŗ: 'R',
          Ř: 'R',
          ŕ: 'r',
          ŗ: 'r',
          ř: 'r',
          Ś: 'S',
          Ŝ: 'S',
          Ş: 'S',
          Š: 'S',
          ś: 's',
          ŝ: 's',
          ş: 's',
          š: 's',
          Ţ: 'T',
          Ť: 'T',
          Ŧ: 'T',
          ţ: 't',
          ť: 't',
          ŧ: 't',
          Ũ: 'U',
          Ū: 'U',
          Ŭ: 'U',
          Ů: 'U',
          Ű: 'U',
          Ų: 'U',
          ũ: 'u',
          ū: 'u',
          ŭ: 'u',
          ů: 'u',
          ű: 'u',
          ų: 'u',
          Ŵ: 'W',
          ŵ: 'w',
          Ŷ: 'Y',
          ŷ: 'y',
          Ÿ: 'Y',
          Ź: 'Z',
          Ż: 'Z',
          Ž: 'Z',
          ź: 'z',
          ż: 'z',
          ž: 'z',
          Ĳ: 'IJ',
          ĳ: 'ij',
          Œ: 'Oe',
          œ: 'oe',
          ŉ: "'n",
          ſ: 's'
        },
        _n = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        },
        vn = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'"
        },
        yn = {
          '\\': '\\',
          "'": "'",
          '\n': 'n',
          '\r': 'r',
          '\u2028': 'u2028',
          '\u2029': 'u2029'
        },
        bn = parseFloat,
        xn = parseInt,
        Sn = typeof global == 'object' && global && global.Object === Object && global,
        Cn = typeof self == 'object' && self && self.Object === Object && self,
        wn = Sn || Cn || Function('return this')(),
        Tn = typeof e == 'object' && e && !e.nodeType && e,
        En = Tn && typeof t == 'object' && t && !t.nodeType && t,
        Dn = En && En.exports === Tn,
        On = Dn && Sn.process,
        kn = (function () {
          try {
            return (En && En.require && En.require('util').types) || (On && On.binding && On.binding('util'));
          } catch {}
        })(),
        An = kn && kn.isArrayBuffer,
        jn = kn && kn.isDate,
        Mn = kn && kn.isMap,
        Nn = kn && kn.isRegExp,
        Pn = kn && kn.isSet,
        Fn = kn && kn.isTypedArray;
      function In(e, t, n) {
        switch (n.length) {
          case 0:
            return e.call(t);
          case 1:
            return e.call(t, n[0]);
          case 2:
            return e.call(t, n[0], n[1]);
          case 3:
            return e.call(t, n[0], n[1], n[2]);
        }
        return e.apply(t, n);
      }
      function Ln(e, t, n, r) {
        for (var i = -1, a = e == null ? 0 : e.length; ++i < a; ) {
          var o = e[i];
          t(r, o, n(o), e);
        }
        return r;
      }
      function Rn(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length; ++n < r && t(e[n], n, e) !== !1; );
        return e;
      }
      function zn(e, t) {
        for (var n = e == null ? 0 : e.length; n-- && t(e[n], n, e) !== !1; );
        return e;
      }
      function Bn(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length; ++n < r; ) if (!t(e[n], n, e)) return !1;
        return !0;
      }
      function Vn(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length, i = 0, a = []; ++n < r; ) {
          var o = e[n];
          t(o, n, e) && (a[i++] = o);
        }
        return a;
      }
      function Hn(e, t) {
        return !!(e != null && e.length) && Zn(e, t, 0) > -1;
      }
      function Un(e, t, n) {
        for (var r = -1, i = e == null ? 0 : e.length; ++r < i; ) if (n(t, e[r])) return !0;
        return !1;
      }
      function N(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length, i = Array(r); ++n < r; ) i[n] = t(e[n], n, e);
        return i;
      }
      function Wn(e, t) {
        for (var n = -1, r = t.length, i = e.length; ++n < r; ) e[i + n] = t[n];
        return e;
      }
      function P(e, t, n, r) {
        var i = -1,
          a = e == null ? 0 : e.length;
        for (r && a && (n = e[++i]); ++i < a; ) n = t(n, e[i], i, e);
        return n;
      }
      function Gn(e, t, n, r) {
        var i = e == null ? 0 : e.length;
        for (r && i && (n = e[--i]); i--; ) n = t(n, e[i], i, e);
        return n;
      }
      function Kn(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length; ++n < r; ) if (t(e[n], n, e)) return !0;
        return !1;
      }
      var F = tr('length');
      function qn(e) {
        return e.split('');
      }
      function Jn(e) {
        return e.match(mt) || [];
      }
      function Yn(e, t, n) {
        var r;
        return (
          n(e, function (e, n, i) {
            if (t(e, n, i)) return ((r = n), !1);
          }),
          r
        );
      }
      function Xn(e, t, n, r) {
        for (var i = e.length, a = n + (r ? 1 : -1); r ? a-- : ++a < i; ) if (t(e[a], a, e)) return a;
        return -1;
      }
      function Zn(e, t, n) {
        return t === t ? Er(e, t, n) : Xn(e, $n, n);
      }
      function Qn(e, t, n, r) {
        for (var i = n - 1, a = e.length; ++i < a; ) if (r(e[i], t)) return i;
        return -1;
      }
      function $n(e) {
        return e !== e;
      }
      function er(e, t) {
        var n = e == null ? 0 : e.length;
        return n ? ar(e, t) / n : pe;
      }
      function tr(e) {
        return function (t) {
          return t == null ? n : t[e];
        };
      }
      function nr(e) {
        return function (t) {
          return e == null ? n : e[t];
        };
      }
      function rr(e, t, n, r, i) {
        return (
          i(e, function (e, i, a) {
            n = r ? ((r = !1), e) : t(n, e, i, a);
          }),
          n
        );
      }
      function ir(e, t) {
        var n = e.length;
        for (e.sort(t); n--; ) e[n] = e[n].value;
        return e;
      }
      function ar(e, t) {
        for (var r, i = -1, a = e.length; ++i < a; ) {
          var o = t(e[i]);
          o !== n && (r = r === n ? o : r + o);
        }
        return r;
      }
      function or(e, t) {
        for (var n = -1, r = Array(e); ++n < e; ) r[n] = t(n);
        return r;
      }
      function sr(e, t) {
        return N(t, function (t) {
          return [t, e[t]];
        });
      }
      function cr(e) {
        return e && e.slice(0, Ar(e) + 1).replace(ut, '');
      }
      function I(e) {
        return function (t) {
          return e(t);
        };
      }
      function lr(e, t) {
        return N(t, function (t) {
          return e[t];
        });
      }
      function ur(e, t) {
        return e.has(t);
      }
      function dr(e, t) {
        for (var n = -1, r = e.length; ++n < r && Zn(t, e[n], 0) > -1; );
        return n;
      }
      function fr(e, t) {
        for (var n = e.length; n-- && Zn(t, e[n], 0) > -1; );
        return n;
      }
      function pr(e, t) {
        for (var n = e.length, r = 0; n--; ) e[n] === t && ++r;
        return r;
      }
      var mr = nr(gn),
        hr = nr(_n);
      function gr(e) {
        return '\\' + yn[e];
      }
      function _r(e, t) {
        return e == null ? n : e[t];
      }
      function vr(e) {
        return fn.test(e);
      }
      function yr(e) {
        return pn.test(e);
      }
      function br(e) {
        for (var t, n = []; !(t = e.next()).done; ) n.push(t.value);
        return n;
      }
      function xr(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (e, r) {
            n[++t] = [r, e];
          }),
          n
        );
      }
      function Sr(e, t) {
        return function (n) {
          return e(t(n));
        };
      }
      function Cr(e, t) {
        for (var n = -1, r = e.length, i = 0, a = []; ++n < r; ) {
          var o = e[n];
          (o === t || o === d) && ((e[n] = d), (a[i++] = n));
        }
        return a;
      }
      function wr(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (e) {
            n[++t] = e;
          }),
          n
        );
      }
      function Tr(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (e) {
            n[++t] = [e, e];
          }),
          n
        );
      }
      function Er(e, t, n) {
        for (var r = n - 1, i = e.length; ++r < i; ) if (e[r] === t) return r;
        return -1;
      }
      function Dr(e, t, n) {
        for (var r = n + 1; r--; ) if (e[r] === t) return r;
        return r;
      }
      function Or(e) {
        return vr(e) ? Mr(e) : F(e);
      }
      function kr(e) {
        return vr(e) ? Nr(e) : qn(e);
      }
      function Ar(e) {
        for (var t = e.length; t-- && E.test(e.charAt(t)); );
        return t;
      }
      var jr = nr(vn);
      function Mr(e) {
        for (var t = (un.lastIndex = 0); un.test(e); ) ++t;
        return t;
      }
      function Nr(e) {
        return e.match(un) || [];
      }
      function Pr(e) {
        return e.match(dn) || [];
      }
      var Fr = (function e(t) {
        t = t == null ? wn : Fr.defaults(wn.Object(), t, Fr.pick(wn, mn));
        var E = t.Array,
          mt = t.Date,
          Et = t.Error,
          Dt = t.Function,
          Ot = t.Math,
          O = t.Object,
          k = t.RegExp,
          kt = t.String,
          At = t.TypeError,
          jt = E.prototype,
          Mt = Dt.prototype,
          Nt = O.prototype,
          Pt = t['__core-js_shared__'],
          Ft = Mt.toString,
          A = Nt.hasOwnProperty,
          It = 0,
          Lt = (function () {
            var e = /[^.]+$/.exec((Pt && Pt.keys && Pt.keys.IE_PROTO) || '');
            return e ? 'Symbol(src)_1.' + e : '';
          })(),
          Rt = Nt.toString,
          zt = Ft.call(O),
          Bt = wn._,
          Vt = k(
            '^' +
              Ft.call(A)
                .replace(ct, '\\$&')
                .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
              '$'
          ),
          Ht = Dn ? t.Buffer : n,
          Ut = t.Symbol,
          Wt = t.Uint8Array,
          Gt = Ht ? Ht.allocUnsafe : n,
          Kt = Sr(O.getPrototypeOf, O),
          qt = O.create,
          Jt = Nt.propertyIsEnumerable,
          Yt = jt.splice,
          Xt = Ut ? Ut.isConcatSpreadable : n,
          Zt = Ut ? Ut.iterator : n,
          Qt = Ut ? Ut.toStringTag : n,
          $t = (function () {
            try {
              var e = $o(O, 'defineProperty');
              return (e({}, '', {}), e);
            } catch {}
          })(),
          en = t.clearTimeout !== wn.clearTimeout && t.clearTimeout,
          tn = mt && mt.now !== wn.Date.now && mt.now,
          nn = t.setTimeout !== wn.setTimeout && t.setTimeout,
          rn = Ot.ceil,
          an = Ot.floor,
          on = O.getOwnPropertySymbols,
          sn = Ht ? Ht.isBuffer : n,
          un = t.isFinite,
          dn = jt.join,
          fn = Sr(O.keys, O),
          pn = Ot.max,
          gn = Ot.min,
          _n = mt.now,
          vn = t.parseInt,
          yn = Ot.random,
          Sn = jt.reverse,
          Cn = $o(t, 'DataView'),
          Tn = $o(t, 'Map'),
          En = $o(t, 'Promise'),
          On = $o(t, 'Set'),
          kn = $o(t, 'WeakMap'),
          F = $o(O, 'create'),
          qn = kn && new kn(),
          nr = {},
          Er = Is(Cn),
          Mr = Is(Tn),
          Nr = Is(En),
          Ir = Is(On),
          Lr = Is(kn),
          Rr = Ut ? Ut.prototype : n,
          zr = Rr ? Rr.valueOf : n,
          Br = Rr ? Rr.toString : n;
        function L(e) {
          if (Ou(e) && !Z(e) && !(e instanceof R)) {
            if (e instanceof Ur) return e;
            if (A.call(e, '__wrapped__')) return Rs(e);
          }
          return new Ur(e);
        }
        var Vr = (function () {
          function e() {}
          return function (t) {
            if (!Du(t)) return {};
            if (qt) return qt(t);
            e.prototype = t;
            var r = new e();
            return ((e.prototype = n), r);
          };
        })();
        function Hr() {}
        function Ur(e, t) {
          ((this.__wrapped__ = e),
            (this.__actions__ = []),
            (this.__chain__ = !!t),
            (this.__index__ = 0),
            (this.__values__ = n));
        }
        ((L.templateSettings = {
          escape: nt,
          evaluate: rt,
          interpolate: it,
          variable: '',
          imports: { _: L }
        }),
          (L.prototype = Hr.prototype),
          (L.prototype.constructor = L),
          (Ur.prototype = Vr(Hr.prototype)),
          (Ur.prototype.constructor = Ur));
        function R(e) {
          ((this.__wrapped__ = e),
            (this.__actions__ = []),
            (this.__dir__ = 1),
            (this.__filtered__ = !1),
            (this.__iteratees__ = []),
            (this.__takeCount__ = me),
            (this.__views__ = []));
        }
        function z() {
          var e = new R(this.__wrapped__);
          return (
            (e.__actions__ = uo(this.__actions__)),
            (e.__dir__ = this.__dir__),
            (e.__filtered__ = this.__filtered__),
            (e.__iteratees__ = uo(this.__iteratees__)),
            (e.__takeCount__ = this.__takeCount__),
            (e.__views__ = uo(this.__views__)),
            e
          );
        }
        function Wr() {
          if (this.__filtered__) {
            var e = new R(this);
            ((e.__dir__ = -1), (e.__filtered__ = !0));
          } else ((e = this.clone()), (e.__dir__ *= -1));
          return e;
        }
        function Gr() {
          var e = this.__wrapped__.value(),
            t = this.__dir__,
            n = Z(e),
            r = t < 0,
            i = n ? e.length : 0,
            a = is(0, i, this.__views__),
            o = a.start,
            s = a.end,
            c = s - o,
            l = r ? s : o - 1,
            u = this.__iteratees__,
            d = u.length,
            f = 0,
            p = gn(c, this.__takeCount__);
          if (!n || (!r && i == c && p == c)) return Ka(e, this.__actions__);
          var m = [];
          outer: for (; c-- && f < p; ) {
            l += t;
            for (var h = -1, g = e[l]; ++h < d; ) {
              var _ = u[h],
                v = _.iteratee,
                y = _.type,
                b = v(g);
              if (y == ce) g = b;
              else if (!b) {
                if (y == se) continue outer;
                break outer;
              }
            }
            m[f++] = g;
          }
          return m;
        }
        ((R.prototype = Vr(Hr.prototype)), (R.prototype.constructor = R));
        function Kr(e) {
          var t = -1,
            n = e == null ? 0 : e.length;
          for (this.clear(); ++t < n; ) {
            var r = e[t];
            this.set(r[0], r[1]);
          }
        }
        function qr() {
          ((this.__data__ = F ? F(null) : {}), (this.size = 0));
        }
        function B(e) {
          var t = this.has(e) && delete this.__data__[e];
          return ((this.size -= +!!t), t);
        }
        function Jr(e) {
          var t = this.__data__;
          if (F) {
            var r = t[e];
            return r === l ? n : r;
          }
          return A.call(t, e) ? t[e] : n;
        }
        function V(e) {
          var t = this.__data__;
          return F ? t[e] !== n : A.call(t, e);
        }
        function Yr(e, t) {
          var r = this.__data__;
          return ((this.size += +!this.has(e)), (r[e] = F && t === n ? l : t), this);
        }
        ((Kr.prototype.clear = qr),
          (Kr.prototype.delete = B),
          (Kr.prototype.get = Jr),
          (Kr.prototype.has = V),
          (Kr.prototype.set = Yr));
        function Xr(e) {
          var t = -1,
            n = e == null ? 0 : e.length;
          for (this.clear(); ++t < n; ) {
            var r = e[t];
            this.set(r[0], r[1]);
          }
        }
        function Zr() {
          ((this.__data__ = []), (this.size = 0));
        }
        function Qr(e) {
          var t = this.__data__,
            n = bi(t, e);
          return n < 0 ? !1 : (n == t.length - 1 ? t.pop() : Yt.call(t, n, 1), --this.size, !0);
        }
        function $r(e) {
          var t = this.__data__,
            r = bi(t, e);
          return r < 0 ? n : t[r][1];
        }
        function ei(e) {
          return bi(this.__data__, e) > -1;
        }
        function ti(e, t) {
          var n = this.__data__,
            r = bi(n, e);
          return (r < 0 ? (++this.size, n.push([e, t])) : (n[r][1] = t), this);
        }
        ((Xr.prototype.clear = Zr),
          (Xr.prototype.delete = Qr),
          (Xr.prototype.get = $r),
          (Xr.prototype.has = ei),
          (Xr.prototype.set = ti));
        function ni(e) {
          var t = -1,
            n = e == null ? 0 : e.length;
          for (this.clear(); ++t < n; ) {
            var r = e[t];
            this.set(r[0], r[1]);
          }
        }
        function ri() {
          ((this.size = 0),
            (this.__data__ = {
              hash: new Kr(),
              map: new (Tn || Xr)(),
              string: new Kr()
            }));
        }
        function ii(e) {
          var t = Zo(this, e).delete(e);
          return ((this.size -= +!!t), t);
        }
        function ai(e) {
          return Zo(this, e).get(e);
        }
        function oi(e) {
          return Zo(this, e).has(e);
        }
        function si(e, t) {
          var n = Zo(this, e),
            r = n.size;
          return (n.set(e, t), (this.size += n.size == r ? 0 : 1), this);
        }
        ((ni.prototype.clear = ri),
          (ni.prototype.delete = ii),
          (ni.prototype.get = ai),
          (ni.prototype.has = oi),
          (ni.prototype.set = si));
        function ci(e) {
          var t = -1,
            n = e == null ? 0 : e.length;
          for (this.__data__ = new ni(); ++t < n; ) this.add(e[t]);
        }
        function li(e) {
          return (this.__data__.set(e, l), this);
        }
        function ui(e) {
          return this.__data__.has(e);
        }
        ((ci.prototype.add = ci.prototype.push = li), (ci.prototype.has = ui));
        function di(e) {
          var t = (this.__data__ = new Xr(e));
          this.size = t.size;
        }
        function fi() {
          ((this.__data__ = new Xr()), (this.size = 0));
        }
        function H(e) {
          var t = this.__data__,
            n = t.delete(e);
          return ((this.size = t.size), n);
        }
        function U(e) {
          return this.__data__.get(e);
        }
        function pi(e) {
          return this.__data__.has(e);
        }
        function mi(e, t) {
          var n = this.__data__;
          if (n instanceof Xr) {
            var r = n.__data__;
            if (!Tn || r.length < i - 1) return (r.push([e, t]), (this.size = ++n.size), this);
            n = this.__data__ = new ni(r);
          }
          return (n.set(e, t), (this.size = n.size), this);
        }
        ((di.prototype.clear = fi),
          (di.prototype.delete = H),
          (di.prototype.get = U),
          (di.prototype.has = pi),
          (di.prototype.set = mi));
        function hi(e, t) {
          var n = Z(e),
            r = !n && du(e),
            i = !n && !r && gu(e),
            a = !n && !r && !i && Uu(e),
            o = n || r || i || a,
            s = o ? or(e.length, kt) : [],
            c = s.length;
          for (var l in e)
            (t || A.call(e, l)) &&
              !(
                o &&
                (l == 'length' ||
                  (i && (l == 'offset' || l == 'parent')) ||
                  (a && (l == 'buffer' || l == 'byteLength' || l == 'byteOffset')) ||
                  fs(l, c))
              ) &&
              s.push(l);
          return s;
        }
        function gi(e) {
          var t = e.length;
          return t ? e[Ea(0, t - 1)] : n;
        }
        function W(e, t) {
          return Ns(uo(e), Ei(t, 0, e.length));
        }
        function _i(e) {
          return Ns(uo(e));
        }
        function vi(e, t, r) {
          ((r !== n && !cu(e[t], r)) || (r === n && !(t in e))) && wi(e, t, r);
        }
        function yi(e, t, r) {
          var i = e[t];
          (!(A.call(e, t) && cu(i, r)) || (r === n && !(t in e))) && wi(e, t, r);
        }
        function bi(e, t) {
          for (var n = e.length; n--; ) if (cu(e[n][0], t)) return n;
          return -1;
        }
        function xi(e, t, n, r) {
          return (
            ji(e, function (e, i, a) {
              t(r, e, n(e), a);
            }),
            r
          );
        }
        function Si(e, t) {
          return e && fo(t, Cd(t), e);
        }
        function Ci(e, t) {
          return e && fo(t, wd(t), e);
        }
        function wi(e, t, n) {
          t == '__proto__' && $t
            ? $t(e, t, {
                configurable: !0,
                enumerable: !0,
                value: n,
                writable: !0
              })
            : (e[t] = n);
        }
        function Ti(e, t) {
          for (var r = -1, i = t.length, a = E(i), o = e == null; ++r < i; ) a[r] = o ? n : _d(e, t[r]);
          return a;
        }
        function Ei(e, t, r) {
          return (e === e && (r !== n && (e = e <= r ? e : r), t !== n && (e = e >= t ? e : t)), e);
        }
        function Di(e, t, r, i, a, o) {
          var s,
            c = t & f,
            l = t & p,
            u = t & m;
          if ((r && (s = a ? r(e, i, a, o) : r(e)), s !== n)) return s;
          if (!Du(e)) return e;
          var d = Z(e);
          if (d) {
            if (((s = ss(e)), !c)) return uo(e, s);
          } else {
            var h = rs(e),
              g = h == Te || h == Ee;
            if (gu(e)) return to(e, c);
            if (h == Ae || h == ve || (g && !a)) {
              if (((s = l || g ? {} : cs(e)), !c)) return l ? mo(e, Ci(s, e)) : po(e, Si(s, e));
            } else {
              if (!M[h]) return a ? e : {};
              s = ls(e, h, c);
            }
          }
          o ||= new di();
          var _ = o.get(e);
          if (_) return _;
          (o.set(e, s),
            Bu(e)
              ? e.forEach(function (n) {
                  s.add(Di(n, t, r, n, e, o));
                })
              : ku(e) &&
                e.forEach(function (n, i) {
                  s.set(i, Di(n, t, r, i, e, o));
                }));
          var v = d ? n : (u ? (l ? qo : Ko) : l ? wd : Cd)(e);
          return (
            Rn(v || e, function (n, i) {
              (v && ((i = n), (n = e[i])), yi(s, i, Di(n, t, r, i, e, o)));
            }),
            s
          );
        }
        function Oi(e) {
          var t = Cd(e);
          return function (n) {
            return G(n, e, t);
          };
        }
        function G(e, t, r) {
          var i = r.length;
          if (e == null) return !i;
          for (e = O(e); i--; ) {
            var a = r[i],
              o = t[a],
              s = e[a];
            if ((s === n && !(a in e)) || !o(s)) return !1;
          }
          return !0;
        }
        function ki(e, t, r) {
          if (typeof e != 'function') throw new At(o);
          return ks(function () {
            e.apply(n, r);
          }, t);
        }
        function Ai(e, t, n, r) {
          var a = -1,
            o = Hn,
            s = !0,
            c = e.length,
            l = [],
            u = t.length;
          if (!c) return l;
          (n && (t = N(t, I(n))), r ? ((o = Un), (s = !1)) : t.length >= i && ((o = ur), (s = !1), (t = new ci(t))));
          outer: for (; ++a < c; ) {
            var d = e[a],
              f = n == null ? d : n(d);
            if (((d = r || d !== 0 ? d : 0), s && f === f)) {
              for (var p = u; p--; ) if (t[p] === f) continue outer;
              l.push(d);
            } else o(t, f, r) || l.push(d);
          }
          return l;
        }
        var ji = _o(Bi),
          Mi = _o(Vi, !0);
        function Ni(e, t) {
          var n = !0;
          return (
            ji(e, function (e, r, i) {
              return ((n = !!t(e, r, i)), n);
            }),
            n
          );
        }
        function Pi(e, t, r) {
          for (var i = -1, a = e.length; ++i < a; ) {
            var o = e[i],
              s = t(o);
            if (s != null && (c === n ? s === s && !Hu(s) : r(s, c)))
              var c = s,
                l = o;
          }
          return l;
        }
        function Fi(e, t, r, i) {
          var a = e.length;
          for (
            r = Q(r),
              r < 0 && (r = -r > a ? 0 : a + r),
              i = i === n || i > a ? a : Q(i),
              i < 0 && (i += a),
              i = r > i ? 0 : Zu(i);
            r < i;
          )
            e[r++] = t;
          return e;
        }
        function Ii(e, t) {
          var n = [];
          return (
            ji(e, function (e, r, i) {
              t(e, r, i) && n.push(e);
            }),
            n
          );
        }
        function Li(e, t, n, r, i) {
          var a = -1,
            o = e.length;
          for (n ||= ds, i ||= []; ++a < o; ) {
            var s = e[a];
            t > 0 && n(s) ? (t > 1 ? Li(s, t - 1, n, r, i) : Wn(i, s)) : r || (i[i.length] = s);
          }
          return i;
        }
        var Ri = vo(),
          zi = vo(!0);
        function Bi(e, t) {
          return e && Ri(e, t, Cd);
        }
        function Vi(e, t) {
          return e && zi(e, t, Cd);
        }
        function Hi(e, t) {
          return Vn(t, function (t) {
            return wu(e[t]);
          });
        }
        function Ui(e, t) {
          t = Za(t, e);
          for (var r = 0, i = t.length; e != null && r < i; ) e = e[Fs(t[r++])];
          return r && r == i ? e : n;
        }
        function Wi(e, t, n) {
          var r = t(e);
          return Z(e) ? r : Wn(r, n(e));
        }
        function Gi(e) {
          return e == null ? (e === n ? Le : ke) : Qt && Qt in O(e) ? es(e) : Cs(e);
        }
        function Ki(e, t) {
          return e > t;
        }
        function qi(e, t) {
          return e != null && A.call(e, t);
        }
        function Ji(e, t) {
          return e != null && t in O(e);
        }
        function Yi(e, t, n) {
          return e >= gn(t, n) && e < pn(t, n);
        }
        function Xi(e, t, r) {
          for (var i = r ? Un : Hn, a = e[0].length, o = e.length, s = o, c = E(o), l = Infinity, u = []; s--; ) {
            var d = e[s];
            (s && t && (d = N(d, I(t))),
              (l = gn(d.length, l)),
              (c[s] = !r && (t || (a >= 120 && d.length >= 120)) ? new ci(s && d) : n));
          }
          d = e[0];
          var f = -1,
            p = c[0];
          outer: for (; ++f < a && u.length < l; ) {
            var m = d[f],
              h = t ? t(m) : m;
            if (((m = r || m !== 0 ? m : 0), !(p ? ur(p, h) : i(u, h, r)))) {
              for (s = o; --s; ) {
                var g = c[s];
                if (!(g ? ur(g, h) : i(e[s], h, r))) continue outer;
              }
              (p && p.push(h), u.push(m));
            }
          }
          return u;
        }
        function Zi(e, t, n, r) {
          return (
            Bi(e, function (e, i, a) {
              t(r, n(e), i, a);
            }),
            r
          );
        }
        function Qi(e, t, r) {
          ((t = Za(t, e)), (e = Ts(e, t)));
          var i = e == null ? e : e[Fs(lc(t))];
          return i == null ? n : In(i, e, r);
        }
        function $i(e) {
          return Ou(e) && Gi(e) == ve;
        }
        function ea(e) {
          return Ou(e) && Gi(e) == Be;
        }
        function ta(e) {
          return Ou(e) && Gi(e) == Se;
        }
        function na(e, t, n, r, i) {
          return e === t
            ? !0
            : e == null || t == null || (!Ou(e) && !Ou(t))
              ? e !== e && t !== t
              : ra(e, t, n, r, na, i);
        }
        function ra(e, t, n, r, i, a) {
          var o = Z(e),
            s = Z(t),
            c = o ? ye : rs(e),
            l = s ? ye : rs(t);
          ((c = c == ve ? Ae : c), (l = l == ve ? Ae : l));
          var u = c == Ae,
            d = l == Ae,
            f = c == l;
          if (f && gu(e)) {
            if (!gu(t)) return !1;
            ((o = !0), (u = !1));
          }
          if (f && !u) return ((a ||= new di()), o || Uu(e) ? Ho(e, t, n, r, i, a) : Uo(e, t, c, n, r, i, a));
          if (!(n & h)) {
            var p = u && A.call(e, '__wrapped__'),
              m = d && A.call(t, '__wrapped__');
            if (p || m) {
              var g = p ? e.value() : e,
                _ = m ? t.value() : t;
              return ((a ||= new di()), i(g, _, n, r, a));
            }
          }
          return f ? ((a ||= new di()), Wo(e, t, n, r, i, a)) : !1;
        }
        function ia(e) {
          return Ou(e) && rs(e) == De;
        }
        function aa(e, t, r, i) {
          var a = r.length,
            o = a,
            s = !i;
          if (e == null) return !o;
          for (e = O(e); a--; ) {
            var c = r[a];
            if (s && c[2] ? c[1] !== e[c[0]] : !(c[0] in e)) return !1;
          }
          for (; ++a < o; ) {
            c = r[a];
            var l = c[0],
              u = e[l],
              d = c[1];
            if (s && c[2]) {
              if (u === n && !(l in e)) return !1;
            } else {
              var f = new di();
              if (i) var p = i(u, d, l, e, t, f);
              if (!(p === n ? na(d, u, h | g, i, f) : p)) return !1;
            }
          }
          return !0;
        }
        function oa(e) {
          return !Du(e) || _s(e) ? !1 : (wu(e) ? Vt : bt).test(Is(e));
        }
        function sa(e) {
          return Ou(e) && Gi(e) == Ne;
        }
        function ca(e) {
          return Ou(e) && rs(e) == Pe;
        }
        function la(e) {
          return Ou(e) && Eu(e.length) && !!j[Gi(e)];
        }
        function ua(e) {
          return typeof e == 'function'
            ? e
            : e == null
              ? Mf
              : typeof e == 'object'
                ? Z(e)
                  ? ga(e[0], e[1])
                  : ha(e)
                : Gf(e);
        }
        function da(e) {
          if (!vs(e)) return fn(e);
          var t = [];
          for (var n in O(e)) A.call(e, n) && n != 'constructor' && t.push(n);
          return t;
        }
        function fa(e) {
          if (!Du(e)) return Ss(e);
          var t = vs(e),
            n = [];
          for (var r in e) (r == 'constructor' && (t || !A.call(e, r))) || n.push(r);
          return n;
        }
        function pa(e, t) {
          return e < t;
        }
        function ma(e, t) {
          var n = -1,
            r = pu(e) ? E(e.length) : [];
          return (
            ji(e, function (e, i, a) {
              r[++n] = t(e, i, a);
            }),
            r
          );
        }
        function ha(e) {
          var t = Qo(e);
          return t.length == 1 && t[0][2]
            ? X(t[0][0], t[0][1])
            : function (n) {
                return n === e || aa(n, e, t);
              };
        }
        function ga(e, t) {
          return ms(e) && ys(t)
            ? X(Fs(e), t)
            : function (r) {
                var i = _d(r, e);
                return i === n && i === t ? yd(r, e) : na(t, i, h | g);
              };
        }
        function _a(e, t, r, i, a) {
          e !== t &&
            Ri(
              t,
              function (o, s) {
                if (((a ||= new di()), Du(o))) va(e, t, s, r, _a, i, a);
                else {
                  var c = i ? i(Ds(e, s), o, s + '', e, t, a) : n;
                  (c === n && (c = o), vi(e, s, c));
                }
              },
              wd
            );
        }
        function va(e, t, r, i, a, o, s) {
          var c = Ds(e, r),
            l = Ds(t, r),
            u = s.get(l);
          if (u) {
            vi(e, r, u);
            return;
          }
          var d = o ? o(c, l, r + '', e, t, s) : n,
            f = d === n;
          if (f) {
            var p = Z(l),
              m = !p && gu(l),
              h = !p && !m && Uu(l);
            ((d = l),
              p || m || h
                ? Z(c)
                  ? (d = c)
                  : mu(c)
                    ? (d = uo(c))
                    : m
                      ? ((f = !1), (d = to(l, !0)))
                      : h
                        ? ((f = !1), (d = oo(l, !0)))
                        : (d = [])
                : Lu(l) || du(l)
                  ? ((d = c), du(c) ? (d = $u(c)) : (!Du(c) || wu(c)) && (d = cs(l)))
                  : (f = !1));
          }
          (f && (s.set(l, d), a(d, l, i, o, s), s.delete(l)), vi(e, r, d));
        }
        function ya(e, t) {
          var r = e.length;
          if (r) return ((t += t < 0 ? r : 0), fs(t, r) ? e[t] : n);
        }
        function ba(e, t, n) {
          t = t.length
            ? N(t, function (e) {
                return Z(e)
                  ? function (t) {
                      return Ui(t, e.length === 1 ? e[0] : e);
                    }
                  : e;
              })
            : [Mf];
          var r = -1;
          return (
            (t = N(t, I(J()))),
            ir(
              ma(e, function (e, n, i) {
                return {
                  criteria: N(t, function (t) {
                    return t(e);
                  }),
                  index: ++r,
                  value: e
                };
              }),
              function (e, t) {
                return so(e, t, n);
              }
            )
          );
        }
        function xa(e, t) {
          return Sa(e, t, function (t, n) {
            return yd(e, n);
          });
        }
        function Sa(e, t, n) {
          for (var r = -1, i = t.length, a = {}; ++r < i; ) {
            var o = t[r],
              s = Ui(e, o);
            n(s, o) && ja(a, Za(o, e), s);
          }
          return a;
        }
        function Ca(e) {
          return function (t) {
            return Ui(t, e);
          };
        }
        function wa(e, t, n, r) {
          var i = r ? Qn : Zn,
            a = -1,
            o = t.length,
            s = e;
          for (e === t && (t = uo(t)), n && (s = N(e, I(n))); ++a < o; )
            for (var c = 0, l = t[a], u = n ? n(l) : l; (c = i(s, u, c, r)) > -1; )
              (s !== e && Yt.call(s, c, 1), Yt.call(e, c, 1));
          return e;
        }
        function Ta(e, t) {
          for (var n = e ? t.length : 0, r = n - 1; n--; ) {
            var i = t[n];
            if (n == r || i !== a) {
              var a = i;
              fs(i) ? Yt.call(e, i, 1) : Ua(e, i);
            }
          }
          return e;
        }
        function Ea(e, t) {
          return e + an(yn() * (t - e + 1));
        }
        function Da(e, t, n, r) {
          for (var i = -1, a = pn(rn((t - e) / (n || 1)), 0), o = E(a); a--; ) ((o[r ? a : ++i] = e), (e += n));
          return o;
        }
        function Oa(e, t) {
          var n = '';
          if (!e || t < 1 || t > de) return n;
          do (t % 2 && (n += e), (t = an(t / 2)), t && (e += e));
          while (t);
          return n;
        }
        function K(e, t) {
          return As(ws(e, t, Mf), e + '');
        }
        function ka(e) {
          return gi(Hd(e));
        }
        function Aa(e, t) {
          var n = Hd(e);
          return Ns(n, Ei(t, 0, n.length));
        }
        function ja(e, t, r, i) {
          if (!Du(e)) return e;
          t = Za(t, e);
          for (var a = -1, o = t.length, s = o - 1, c = e; c != null && ++a < o; ) {
            var l = Fs(t[a]),
              u = r;
            if (l === '__proto__' || l === 'constructor' || l === 'prototype') return e;
            if (a != s) {
              var d = c[l];
              ((u = i ? i(d, l, c) : n), u === n && (u = Du(d) ? d : fs(t[a + 1]) ? [] : {}));
            }
            (yi(c, l, u), (c = c[l]));
          }
          return e;
        }
        var Ma = qn
            ? function (e, t) {
                return (qn.set(e, t), e);
              }
            : Mf,
          Na = $t
            ? function (e, t) {
                return $t(e, 'toString', {
                  configurable: !0,
                  enumerable: !1,
                  value: Of(t),
                  writable: !0
                });
              }
            : Mf;
        function Pa(e) {
          return Ns(Hd(e));
        }
        function Fa(e, t, n) {
          var r = -1,
            i = e.length;
          (t < 0 && (t = -t > i ? 0 : i + t),
            (n = n > i ? i : n),
            n < 0 && (n += i),
            (i = t > n ? 0 : (n - t) >>> 0),
            (t >>>= 0));
          for (var a = E(i); ++r < i; ) a[r] = e[r + t];
          return a;
        }
        function Ia(e, t) {
          var n;
          return (
            ji(e, function (e, r, i) {
              return ((n = t(e, r, i)), !n);
            }),
            !!n
          );
        }
        function La(e, t, n) {
          var r = 0,
            i = e == null ? r : e.length;
          if (typeof t == 'number' && t === t && i <= ge) {
            for (; r < i; ) {
              var a = (r + i) >>> 1,
                o = e[a];
              o !== null && !Hu(o) && (n ? o <= t : o < t) ? (r = a + 1) : (i = a);
            }
            return i;
          }
          return Ra(e, t, Mf, n);
        }
        function Ra(e, t, r, i) {
          var a = 0,
            o = e == null ? 0 : e.length;
          if (o === 0) return 0;
          t = r(t);
          for (var s = t !== t, c = t === null, l = Hu(t), u = t === n; a < o; ) {
            var d = an((a + o) / 2),
              f = r(e[d]),
              p = f !== n,
              m = f === null,
              h = f === f,
              g = Hu(f);
            if (s) var _ = i || h;
            else
              _ = u
                ? h && (i || p)
                : c
                  ? h && p && (i || !m)
                  : l
                    ? h && p && !m && (i || !g)
                    : m || g
                      ? !1
                      : i
                        ? f <= t
                        : f < t;
            _ ? (a = d + 1) : (o = d);
          }
          return gn(o, he);
        }
        function za(e, t) {
          for (var n = -1, r = e.length, i = 0, a = []; ++n < r; ) {
            var o = e[n],
              s = t ? t(o) : o;
            if (!n || !cu(s, c)) {
              var c = s;
              a[i++] = o === 0 ? 0 : o;
            }
          }
          return a;
        }
        function Ba(e) {
          return typeof e == 'number' ? e : Hu(e) ? pe : +e;
        }
        function Va(e) {
          if (typeof e == 'string') return e;
          if (Z(e)) return N(e, Va) + '';
          if (Hu(e)) return Br ? Br.call(e) : '';
          var t = e + '';
          return t == '0' && 1 / e == -ue ? '-0' : t;
        }
        function Ha(e, t, n) {
          var r = -1,
            a = Hn,
            o = e.length,
            s = !0,
            c = [],
            l = c;
          if (n) ((s = !1), (a = Un));
          else if (o >= i) {
            var u = t ? null : Io(e);
            if (u) return wr(u);
            ((s = !1), (a = ur), (l = new ci()));
          } else l = t ? [] : c;
          outer: for (; ++r < o; ) {
            var d = e[r],
              f = t ? t(d) : d;
            if (((d = n || d !== 0 ? d : 0), s && f === f)) {
              for (var p = l.length; p--; ) if (l[p] === f) continue outer;
              (t && l.push(f), c.push(d));
            } else a(l, f, n) || (l !== c && l.push(f), c.push(d));
          }
          return c;
        }
        function Ua(e, t) {
          t = Za(t, e);
          var n = -1,
            r = t.length;
          if (!r) return !0;
          for (; ++n < r; ) {
            var i = Fs(t[n]);
            if (
              (i === '__proto__' && !A.call(e, '__proto__')) ||
              ((i === 'constructor' || i === 'prototype') && n < r - 1)
            )
              return !1;
          }
          var a = Ts(e, t);
          return a == null || delete a[Fs(lc(t))];
        }
        function Wa(e, t, n, r) {
          return ja(e, t, n(Ui(e, t)), r);
        }
        function Ga(e, t, n, r) {
          for (var i = e.length, a = r ? i : -1; (r ? a-- : ++a < i) && t(e[a], a, e); );
          return n ? Fa(e, r ? 0 : a, r ? a + 1 : i) : Fa(e, r ? a + 1 : 0, r ? i : a);
        }
        function Ka(e, t) {
          var n = e;
          return (
            n instanceof R && (n = n.value()),
            P(
              t,
              function (e, t) {
                return t.func.apply(t.thisArg, Wn([e], t.args));
              },
              n
            )
          );
        }
        function qa(e, t, n) {
          var r = e.length;
          if (r < 2) return r ? Ha(e[0]) : [];
          for (var i = -1, a = E(r); ++i < r; )
            for (var o = e[i], s = -1; ++s < r; ) s != i && (a[i] = Ai(a[i] || o, e[s], t, n));
          return Ha(Li(a, 1), t, n);
        }
        function Ja(e, t, r) {
          for (var i = -1, a = e.length, o = t.length, s = {}; ++i < a; ) {
            var c = i < o ? t[i] : n;
            r(s, e[i], c);
          }
          return s;
        }
        function Ya(e) {
          return mu(e) ? e : [];
        }
        function Xa(e) {
          return typeof e == 'function' ? e : Mf;
        }
        function Za(e, t) {
          return Z(e) ? e : ms(e, t) ? [e] : Ps($(e));
        }
        var Qa = K;
        function $a(e, t, r) {
          var i = e.length;
          return ((r = r === n ? i : r), !t && r >= i ? e : Fa(e, t, r));
        }
        var eo =
          en ||
          function (e) {
            return wn.clearTimeout(e);
          };
        function to(e, t) {
          if (t) return e.slice();
          var n = e.length,
            r = Gt ? Gt(n) : new e.constructor(n);
          return (e.copy(r), r);
        }
        function no(e) {
          var t = new e.constructor(e.byteLength);
          return (new Wt(t).set(new Wt(e)), t);
        }
        function ro(e, t) {
          var n = t ? no(e.buffer) : e.buffer;
          return new e.constructor(n, e.byteOffset, e.byteLength);
        }
        function io(e) {
          var t = new e.constructor(e.source, vt.exec(e));
          return ((t.lastIndex = e.lastIndex), t);
        }
        function ao(e) {
          return zr ? O(zr.call(e)) : {};
        }
        function oo(e, t) {
          var n = t ? no(e.buffer) : e.buffer;
          return new e.constructor(n, e.byteOffset, e.length);
        }
        function q(e, t) {
          if (e !== t) {
            var r = e !== n,
              i = e === null,
              a = e === e,
              o = Hu(e),
              s = t !== n,
              c = t === null,
              l = t === t,
              u = Hu(t);
            if ((!c && !u && !o && e > t) || (o && s && l && !c && !u) || (i && s && l) || (!r && l) || !a) return 1;
            if ((!i && !o && !u && e < t) || (u && r && a && !i && !o) || (c && r && a) || (!s && a) || !l) return -1;
          }
          return 0;
        }
        function so(e, t, n) {
          for (var r = -1, i = e.criteria, a = t.criteria, o = i.length, s = n.length; ++r < o; ) {
            var c = q(i[r], a[r]);
            if (c) return r >= s ? c : c * (n[r] == 'desc' ? -1 : 1);
          }
          return e.index - t.index;
        }
        function co(e, t, n, r) {
          for (
            var i = -1, a = e.length, o = n.length, s = -1, c = t.length, l = pn(a - o, 0), u = E(c + l), d = !r;
            ++s < c;
          )
            u[s] = t[s];
          for (; ++i < o; ) (d || i < a) && (u[n[i]] = e[i]);
          for (; l--; ) u[s++] = e[i++];
          return u;
        }
        function lo(e, t, n, r) {
          for (
            var i = -1,
              a = e.length,
              o = -1,
              s = n.length,
              c = -1,
              l = t.length,
              u = pn(a - s, 0),
              d = E(u + l),
              f = !r;
            ++i < u;
          )
            d[i] = e[i];
          for (var p = i; ++c < l; ) d[p + c] = t[c];
          for (; ++o < s; ) (f || i < a) && (d[p + n[o]] = e[i++]);
          return d;
        }
        function uo(e, t) {
          var n = -1,
            r = e.length;
          for (t ||= E(r); ++n < r; ) t[n] = e[n];
          return t;
        }
        function fo(e, t, r, i) {
          var a = !r;
          r ||= {};
          for (var o = -1, s = t.length; ++o < s; ) {
            var c = t[o],
              l = i ? i(r[c], e[c], c, r, e) : n;
            (l === n && (l = e[c]), a ? wi(r, c, l) : yi(r, c, l));
          }
          return r;
        }
        function po(e, t) {
          return fo(e, ts(e), t);
        }
        function mo(e, t) {
          return fo(e, ns(e), t);
        }
        function ho(e, t) {
          return function (n, r) {
            var i = Z(n) ? Ln : xi,
              a = t ? t() : {};
            return i(n, e, J(r, 2), a);
          };
        }
        function go(e) {
          return K(function (t, r) {
            var i = -1,
              a = r.length,
              o = a > 1 ? r[a - 1] : n,
              s = a > 2 ? r[2] : n;
            for (
              o = e.length > 3 && typeof o == 'function' ? (a--, o) : n,
                s && ps(r[0], r[1], s) && ((o = a < 3 ? n : o), (a = 1)),
                t = O(t);
              ++i < a;
            ) {
              var c = r[i];
              c && e(t, c, i, o);
            }
            return t;
          });
        }
        function _o(e, t) {
          return function (n, r) {
            if (n == null) return n;
            if (!pu(n)) return e(n, r);
            for (var i = n.length, a = t ? i : -1, o = O(n); (t ? a-- : ++a < i) && r(o[a], a, o) !== !1; );
            return n;
          };
        }
        function vo(e) {
          return function (t, n, r) {
            for (var i = -1, a = O(t), o = r(t), s = o.length; s--; ) {
              var c = o[e ? s : ++i];
              if (n(a[c], c, a) === !1) break;
            }
            return t;
          };
        }
        function yo(e, t, n) {
          var r = t & _,
            i = So(e);
          function a() {
            return (this && this !== wn && this instanceof a ? i : e).apply(r ? n : this, arguments);
          }
          return a;
        }
        function bo(e) {
          return function (t) {
            t = $(t);
            var r = vr(t) ? kr(t) : n,
              i = r ? r[0] : t.charAt(0),
              a = r ? $a(r, 1).join('') : t.slice(1);
            return i[e]() + a;
          };
        }
        function xo(e) {
          return function (t) {
            return P(Cf(Yd(t).replace(cn, '')), e, '');
          };
        }
        function So(e) {
          return function () {
            var t = arguments;
            switch (t.length) {
              case 0:
                return new e();
              case 1:
                return new e(t[0]);
              case 2:
                return new e(t[0], t[1]);
              case 3:
                return new e(t[0], t[1], t[2]);
              case 4:
                return new e(t[0], t[1], t[2], t[3]);
              case 5:
                return new e(t[0], t[1], t[2], t[3], t[4]);
              case 6:
                return new e(t[0], t[1], t[2], t[3], t[4], t[5]);
              case 7:
                return new e(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
            }
            var n = Vr(e.prototype),
              r = e.apply(n, t);
            return Du(r) ? r : n;
          };
        }
        function Co(e, t, r) {
          var i = So(e);
          function a() {
            for (var o = arguments.length, s = E(o), c = o, l = Xo(a); c--; ) s[c] = arguments[c];
            var u = o < 3 && s[0] !== l && s[o - 1] !== l ? [] : Cr(s, l);
            return (
              (o -= u.length),
              o < r
                ? Po(e, t, Eo, a.placeholder, n, s, u, n, n, r - o)
                : In(this && this !== wn && this instanceof a ? i : e, this, s)
            );
          }
          return a;
        }
        function wo(e) {
          return function (t, r, i) {
            var a = O(t);
            if (!pu(t)) {
              var o = J(r, 3);
              ((t = Cd(t)),
                (r = function (e) {
                  return o(a[e], e, a);
                }));
            }
            var s = e(t, r, i);
            return s > -1 ? a[o ? t[s] : s] : n;
          };
        }
        function To(e) {
          return Go(function (t) {
            var r = t.length,
              i = r,
              a = Ur.prototype.thru;
            for (e && t.reverse(); i--; ) {
              var s = t[i];
              if (typeof s != 'function') throw new At(o);
              if (a && !c && Yo(s) == 'wrapper') var c = new Ur([], !0);
            }
            for (i = c ? i : r; ++i < r; ) {
              s = t[i];
              var l = Yo(s),
                u = l == 'wrapper' ? Jo(s) : n;
              c =
                u && gs(u[0]) && u[1] == (ee | b | S | te) && !u[4].length && u[9] == 1
                  ? c[Yo(u[0])].apply(c, u[3])
                  : s.length == 1 && gs(s)
                    ? c[l]()
                    : c.thru(s);
            }
            return function () {
              var e = arguments,
                n = e[0];
              if (c && e.length == 1 && Z(n)) return c.plant(n).value();
              for (var i = 0, a = r ? t[i].apply(this, e) : n; ++i < r; ) a = t[i].call(this, a);
              return a;
            };
          });
        }
        function Eo(e, t, r, i, a, o, s, c, l, u) {
          var d = t & ee,
            f = t & _,
            p = t & v,
            m = t & (b | x),
            h = t & ne,
            g = p ? n : So(e);
          function y() {
            for (var n = arguments.length, _ = E(n), v = n; v--; ) _[v] = arguments[v];
            if (m)
              var b = Xo(y),
                x = pr(_, b);
            if ((i && (_ = co(_, i, a, m)), o && (_ = lo(_, o, s, m)), (n -= x), m && n < u)) {
              var S = Cr(_, b);
              return Po(e, t, Eo, y.placeholder, r, _, S, c, l, u - n);
            }
            var C = f ? r : this,
              ee = p ? C[e] : e;
            return (
              (n = _.length),
              c ? (_ = Es(_, c)) : h && n > 1 && _.reverse(),
              d && l < n && (_.length = l),
              this && this !== wn && this instanceof y && (ee = g || So(ee)),
              ee.apply(C, _)
            );
          }
          return y;
        }
        function Do(e, t) {
          return function (n, r) {
            return Zi(n, e, t(r), {});
          };
        }
        function Oo(e, t) {
          return function (r, i) {
            var a;
            if (r === n && i === n) return t;
            if ((r !== n && (a = r), i !== n)) {
              if (a === n) return i;
              (typeof r == 'string' || typeof i == 'string' ? ((r = Va(r)), (i = Va(i))) : ((r = Ba(r)), (i = Ba(i))),
                (a = e(r, i)));
            }
            return a;
          };
        }
        function ko(e) {
          return Go(function (t) {
            return (
              (t = N(t, I(J()))),
              K(function (n) {
                var r = this;
                return e(t, function (e) {
                  return In(e, r, n);
                });
              })
            );
          });
        }
        function Ao(e, t) {
          t = t === n ? ' ' : Va(t);
          var r = t.length;
          if (r < 2) return r ? Oa(t, e) : t;
          var i = Oa(t, rn(e / Or(t)));
          return vr(t) ? $a(kr(i), 0, e).join('') : i.slice(0, e);
        }
        function jo(e, t, n, r) {
          var i = t & _,
            a = So(e);
          function o() {
            for (
              var t = -1,
                s = arguments.length,
                c = -1,
                l = r.length,
                u = E(l + s),
                d = this && this !== wn && this instanceof o ? a : e;
              ++c < l;
            )
              u[c] = r[c];
            for (; s--; ) u[c++] = arguments[++t];
            return In(d, i ? n : this, u);
          }
          return o;
        }
        function Mo(e) {
          return function (t, r, i) {
            return (
              i && typeof i != 'number' && ps(t, r, i) && (r = i = n),
              (t = Xu(t)),
              r === n ? ((r = t), (t = 0)) : (r = Xu(r)),
              (i = i === n ? (t < r ? 1 : -1) : Xu(i)),
              Da(t, r, i, e)
            );
          };
        }
        function No(e) {
          return function (t, n) {
            return ((typeof t == 'string' && typeof n == 'string') || ((t = Qu(t)), (n = Qu(n))), e(t, n));
          };
        }
        function Po(e, t, r, i, a, o, s, c, l, u) {
          var d = t & b,
            f = d ? s : n,
            p = d ? n : s,
            m = d ? o : n,
            h = d ? n : o;
          ((t |= d ? S : C), (t &= ~(d ? C : S)), t & y || (t &= ~(_ | v)));
          var g = [e, t, a, m, f, h, p, c, l, u],
            x = r.apply(n, g);
          return (gs(e) && Os(x, g), (x.placeholder = i), js(x, e, t));
        }
        function Fo(e) {
          var t = Ot[e];
          return function (e, n) {
            if (((e = Qu(e)), (n = n == null ? 0 : gn(Q(n), 292)), n && un(e))) {
              var r = ($(e) + 'e').split('e');
              return ((r = ($(t(r[0] + 'e' + (+r[1] + n))) + 'e').split('e')), +(r[0] + 'e' + (+r[1] - n)));
            }
            return t(e);
          };
        }
        var Io =
          On && 1 / wr(new On([, -0]))[1] == ue
            ? function (e) {
                return new On(e);
              }
            : Bf;
        function Lo(e) {
          return function (t) {
            var n = rs(t);
            return n == De ? xr(t) : n == Pe ? Tr(t) : sr(t, e(t));
          };
        }
        function Ro(e, t, r, i, a, s, c, l) {
          var u = t & v;
          if (!u && typeof e != 'function') throw new At(o);
          var d = i ? i.length : 0;
          if (
            (d || ((t &= ~(S | C)), (i = a = n)),
            (c = c === n ? c : pn(Q(c), 0)),
            (l = l === n ? l : Q(l)),
            (d -= a ? a.length : 0),
            t & C)
          ) {
            var f = i,
              p = a;
            i = a = n;
          }
          var m = u ? n : Jo(e),
            h = [e, t, r, i, a, f, p, s, c, l];
          if (
            (m && xs(h, m),
            (e = h[0]),
            (t = h[1]),
            (r = h[2]),
            (i = h[3]),
            (a = h[4]),
            (l = h[9] = h[9] === n ? (u ? 0 : e.length) : pn(h[9] - d, 0)),
            !l && t & (b | x) && (t &= ~(b | x)),
            !t || t == _)
          )
            var g = yo(e, t, r);
          else
            g =
              t == b || t == x ? Co(e, t, l) : (t == S || t == (_ | S)) && !a.length ? jo(e, t, r, i) : Eo.apply(n, h);
          return js((m ? Ma : Os)(g, h), e, t);
        }
        function zo(e, t, r, i) {
          return e === n || (cu(e, Nt[r]) && !A.call(i, r)) ? t : e;
        }
        function Bo(e, t, r, i, a, o) {
          return (Du(e) && Du(t) && (o.set(t, e), _a(e, t, n, Bo, o), o.delete(t)), e);
        }
        function Vo(e) {
          return Lu(e) ? n : e;
        }
        function Ho(e, t, r, i, a, o) {
          var s = r & h,
            c = e.length,
            l = t.length;
          if (c != l && !(s && l > c)) return !1;
          var u = o.get(e),
            d = o.get(t);
          if (u && d) return u == t && d == e;
          var f = -1,
            p = !0,
            m = r & g ? new ci() : n;
          for (o.set(e, t), o.set(t, e); ++f < c; ) {
            var _ = e[f],
              v = t[f];
            if (i) var y = s ? i(v, _, f, t, e, o) : i(_, v, f, e, t, o);
            if (y !== n) {
              if (y) continue;
              p = !1;
              break;
            }
            if (m) {
              if (
                !Kn(t, function (e, t) {
                  if (!ur(m, t) && (_ === e || a(_, e, r, i, o))) return m.push(t);
                })
              ) {
                p = !1;
                break;
              }
            } else if (!(_ === v || a(_, v, r, i, o))) {
              p = !1;
              break;
            }
          }
          return (o.delete(e), o.delete(t), p);
        }
        function Uo(e, t, n, r, i, a, o) {
          switch (n) {
            case w:
              if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
              ((e = e.buffer), (t = t.buffer));
            case Be:
              return !(e.byteLength != t.byteLength || !a(new Wt(e), new Wt(t)));
            case xe:
            case Se:
            case Oe:
              return cu(+e, +t);
            case we:
              return e.name == t.name && e.message == t.message;
            case Ne:
            case Fe:
              return e == t + '';
            case De:
              var s = xr;
            case Pe:
              var c = r & h;
              if (((s ||= wr), e.size != t.size && !c)) return !1;
              var l = o.get(e);
              if (l) return l == t;
              ((r |= g), o.set(e, t));
              var u = Ho(s(e), s(t), r, i, a, o);
              return (o.delete(e), u);
            case Ie:
              if (zr) return zr.call(e) == zr.call(t);
          }
          return !1;
        }
        function Wo(e, t, r, i, a, o) {
          var s = r & h,
            c = Ko(e),
            l = c.length;
          if (l != Ko(t).length && !s) return !1;
          for (var u = l; u--; ) {
            var d = c[u];
            if (!(s ? d in t : A.call(t, d))) return !1;
          }
          var f = o.get(e),
            p = o.get(t);
          if (f && p) return f == t && p == e;
          var m = !0;
          (o.set(e, t), o.set(t, e));
          for (var g = s; ++u < l; ) {
            d = c[u];
            var _ = e[d],
              v = t[d];
            if (i) var y = s ? i(v, _, d, t, e, o) : i(_, v, d, e, t, o);
            if (!(y === n ? _ === v || a(_, v, r, i, o) : y)) {
              m = !1;
              break;
            }
            g ||= d == 'constructor';
          }
          if (m && !g) {
            var b = e.constructor,
              x = t.constructor;
            b != x &&
              'constructor' in e &&
              'constructor' in t &&
              !(typeof b == 'function' && b instanceof b && typeof x == 'function' && x instanceof x) &&
              (m = !1);
          }
          return (o.delete(e), o.delete(t), m);
        }
        function Go(e) {
          return As(ws(e, n, Qs), e + '');
        }
        function Ko(e) {
          return Wi(e, Cd, ts);
        }
        function qo(e) {
          return Wi(e, wd, ns);
        }
        var Jo = qn
          ? function (e) {
              return qn.get(e);
            }
          : Bf;
        function Yo(e) {
          for (var t = e.name + '', n = nr[t], r = A.call(nr, t) ? n.length : 0; r--; ) {
            var i = n[r],
              a = i.func;
            if (a == null || a == e) return i.name;
          }
          return t;
        }
        function Xo(e) {
          return (A.call(L, 'placeholder') ? L : e).placeholder;
        }
        function J() {
          var e = L.iteratee || Nf;
          return ((e = e === Nf ? ua : e), arguments.length ? e(arguments[0], arguments[1]) : e);
        }
        function Zo(e, t) {
          var n = e.__data__;
          return hs(t) ? n[typeof t == 'string' ? 'string' : 'hash'] : n.map;
        }
        function Qo(e) {
          for (var t = Cd(e), n = t.length; n--; ) {
            var r = t[n],
              i = e[r];
            t[n] = [r, i, ys(i)];
          }
          return t;
        }
        function $o(e, t) {
          var r = _r(e, t);
          return oa(r) ? r : n;
        }
        function es(e) {
          var t = A.call(e, Qt),
            r = e[Qt];
          try {
            e[Qt] = n;
            var i = !0;
          } catch {}
          var a = Rt.call(e);
          return (i && (t ? (e[Qt] = r) : delete e[Qt]), a);
        }
        var ts = on
            ? function (e) {
                return e == null
                  ? []
                  : ((e = O(e)),
                    Vn(on(e), function (t) {
                      return Jt.call(e, t);
                    }));
              }
            : Yf,
          ns = on
            ? function (e) {
                for (var t = []; e; ) (Wn(t, ts(e)), (e = Kt(e)));
                return t;
              }
            : Yf,
          rs = Gi;
        ((Cn && rs(new Cn(/* @__PURE__ */ new ArrayBuffer(1))) != w) ||
          (Tn && rs(new Tn()) != De) ||
          (En && rs(En.resolve()) != je) ||
          (On && rs(new On()) != Pe) ||
          (kn && rs(new kn()) != Re)) &&
          (rs = function (e) {
            var t = Gi(e),
              r = t == Ae ? e.constructor : n,
              i = r ? Is(r) : '';
            if (i)
              switch (i) {
                case Er:
                  return w;
                case Mr:
                  return De;
                case Nr:
                  return je;
                case Ir:
                  return Pe;
                case Lr:
                  return Re;
              }
            return t;
          });
        function is(e, t, n) {
          for (var r = -1, i = n.length; ++r < i; ) {
            var a = n[r],
              o = a.size;
            switch (a.type) {
              case 'drop':
                e += o;
                break;
              case 'dropRight':
                t -= o;
                break;
              case 'take':
                t = gn(t, e + o);
                break;
              case 'takeRight':
                e = pn(e, t - o);
                break;
            }
          }
          return {
            start: e,
            end: t
          };
        }
        function as(e) {
          var t = e.match(ft);
          return t ? t[1].split(pt) : [];
        }
        function os(e, t, n) {
          t = Za(t, e);
          for (var r = -1, i = t.length, a = !1; ++r < i; ) {
            var o = Fs(t[r]);
            if (!(a = e != null && n(e, o))) break;
            e = e[o];
          }
          return a || ++r != i ? a : ((i = e == null ? 0 : e.length), !!i && Eu(i) && fs(o, i) && (Z(e) || du(e)));
        }
        function ss(e) {
          var t = e.length,
            n = new e.constructor(t);
          return (t && typeof e[0] == 'string' && A.call(e, 'index') && ((n.index = e.index), (n.input = e.input)), n);
        }
        function cs(e) {
          return typeof e.constructor == 'function' && !vs(e) ? Vr(Kt(e)) : {};
        }
        function ls(e, t, n) {
          var r = e.constructor;
          switch (t) {
            case Be:
              return no(e);
            case xe:
            case Se:
              return new r(+e);
            case w:
              return ro(e, n);
            case Ve:
            case He:
            case Ue:
            case We:
            case Ge:
            case Ke:
            case qe:
            case Je:
            case Ye:
              return oo(e, n);
            case De:
              return new r();
            case Oe:
            case Fe:
              return new r(e);
            case Ne:
              return io(e);
            case Pe:
              return new r();
            case Ie:
              return ao(e);
          }
        }
        function us(e, t) {
          var n = t.length;
          if (!n) return e;
          var r = n - 1;
          return (
            (t[r] = (n > 1 ? '& ' : '') + t[r]),
            (t = t.join(n > 2 ? ', ' : ' ')),
            e.replace(dt, '{\n/* [wrapped with ' + t + '] */\n')
          );
        }
        function ds(e) {
          return Z(e) || du(e) || !!(Xt && e && e[Xt]);
        }
        function fs(e, t) {
          var n = typeof e;
          return ((t ??= de), !!t && (n == 'number' || (n != 'symbol' && St.test(e))) && e > -1 && e % 1 == 0 && e < t);
        }
        function ps(e, t, n) {
          if (!Du(n)) return !1;
          var r = typeof t;
          return (r == 'number' ? pu(n) && fs(t, n.length) : r == 'string' && t in n) ? cu(n[t], e) : !1;
        }
        function ms(e, t) {
          if (Z(e)) return !1;
          var n = typeof e;
          return n == 'number' || n == 'symbol' || n == 'boolean' || e == null || Hu(e)
            ? !0
            : ot.test(e) || !at.test(e) || (t != null && e in O(t));
        }
        function hs(e) {
          var t = typeof e;
          return t == 'string' || t == 'number' || t == 'symbol' || t == 'boolean' ? e !== '__proto__' : e === null;
        }
        function gs(e) {
          var t = Yo(e),
            n = L[t];
          if (typeof n != 'function' || !(t in R.prototype)) return !1;
          if (e === n) return !0;
          var r = Jo(n);
          return !!r && e === r[0];
        }
        function _s(e) {
          return !!Lt && Lt in e;
        }
        var Y = Pt ? wu : Xf;
        function vs(e) {
          var t = e && e.constructor;
          return e === ((typeof t == 'function' && t.prototype) || Nt);
        }
        function ys(e) {
          return e === e && !Du(e);
        }
        function X(e, t) {
          return function (r) {
            return r == null ? !1 : r[e] === t && (t !== n || e in O(r));
          };
        }
        function bs(e) {
          var t = Wl(e, function (e) {
              return (n.size === u && n.clear(), e);
            }),
            n = t.cache;
          return t;
        }
        function xs(e, t) {
          var n = e[1],
            r = t[1],
            i = n | r,
            a = i < (_ | v | ee),
            o =
              (r == ee && n == b) ||
              (r == ee && n == te && e[7].length <= t[8]) ||
              (r == (ee | te) && t[7].length <= t[8] && n == b);
          if (!(a || o)) return e;
          r & _ && ((e[2] = t[2]), (i |= n & _ ? 0 : y));
          var s = t[3];
          if (s) {
            var c = e[3];
            ((e[3] = c ? co(c, s, t[4]) : s), (e[4] = c ? Cr(e[3], d) : t[4]));
          }
          return (
            (s = t[5]),
            s && ((c = e[5]), (e[5] = c ? lo(c, s, t[6]) : s), (e[6] = c ? Cr(e[5], d) : t[6])),
            (s = t[7]),
            s && (e[7] = s),
            r & ee && (e[8] = e[8] == null ? t[8] : gn(e[8], t[8])),
            (e[9] ??= t[9]),
            (e[0] = t[0]),
            (e[1] = i),
            e
          );
        }
        function Ss(e) {
          var t = [];
          if (e != null) for (var n in O(e)) t.push(n);
          return t;
        }
        function Cs(e) {
          return Rt.call(e);
        }
        function ws(e, t, r) {
          return (
            (t = pn(t === n ? e.length - 1 : t, 0)),
            function () {
              for (var n = arguments, i = -1, a = pn(n.length - t, 0), o = E(a); ++i < a; ) o[i] = n[t + i];
              i = -1;
              for (var s = E(t + 1); ++i < t; ) s[i] = n[i];
              return ((s[t] = r(o)), In(e, this, s));
            }
          );
        }
        function Ts(e, t) {
          return t.length < 2 ? e : Ui(e, Fa(t, 0, -1));
        }
        function Es(e, t) {
          for (var r = e.length, i = gn(t.length, r), a = uo(e); i--; ) {
            var o = t[i];
            e[i] = fs(o, r) ? a[o] : n;
          }
          return e;
        }
        function Ds(e, t) {
          if (!(t === 'constructor' && typeof e[t] == 'function') && t != '__proto__') return e[t];
        }
        var Os = Ms(Ma),
          ks =
            nn ||
            function (e, t) {
              return wn.setTimeout(e, t);
            },
          As = Ms(Na);
        function js(e, t, n) {
          var r = t + '';
          return As(e, us(r, Ls(as(r), n)));
        }
        function Ms(e) {
          var t = 0,
            r = 0;
          return function () {
            var i = _n(),
              a = oe - (i - r);
            if (((r = i), a > 0)) {
              if (++t >= ae) return arguments[0];
            } else t = 0;
            return e.apply(n, arguments);
          };
        }
        function Ns(e, t) {
          var r = -1,
            i = e.length,
            a = i - 1;
          for (t = t === n ? i : t; ++r < t; ) {
            var o = Ea(r, a),
              s = e[o];
            ((e[o] = e[r]), (e[r] = s));
          }
          return ((e.length = t), e);
        }
        var Ps = bs(function (e) {
          var t = [];
          return (
            e.charCodeAt(0) === 46 && t.push(''),
            e.replace(st, function (e, n, r, i) {
              t.push(r ? i.replace(gt, '$1') : n || e);
            }),
            t
          );
        });
        function Fs(e) {
          if (typeof e == 'string' || Hu(e)) return e;
          var t = e + '';
          return t == '0' && 1 / e == -ue ? '-0' : t;
        }
        function Is(e) {
          if (e != null) {
            try {
              return Ft.call(e);
            } catch {}
            try {
              return e + '';
            } catch {}
          }
          return '';
        }
        function Ls(e, t) {
          return (
            Rn(_e, function (n) {
              var r = '_.' + n[0];
              t & n[1] && !Hn(e, r) && e.push(r);
            }),
            e.sort()
          );
        }
        function Rs(e) {
          if (e instanceof R) return e.clone();
          var t = new Ur(e.__wrapped__, e.__chain__);
          return ((t.__actions__ = uo(e.__actions__)), (t.__index__ = e.__index__), (t.__values__ = e.__values__), t);
        }
        function zs(e, t, r) {
          t = (r ? ps(e, t, r) : t === n) ? 1 : pn(Q(t), 0);
          var i = e == null ? 0 : e.length;
          if (!i || t < 1) return [];
          for (var a = 0, o = 0, s = E(rn(i / t)); a < i; ) s[o++] = Fa(e, a, (a += t));
          return s;
        }
        function Bs(e) {
          for (var t = -1, n = e == null ? 0 : e.length, r = 0, i = []; ++t < n; ) {
            var a = e[t];
            a && (i[r++] = a);
          }
          return i;
        }
        function Vs() {
          var e = arguments.length;
          if (!e) return [];
          for (var t = E(e - 1), n = arguments[0], r = e; r--; ) t[r - 1] = arguments[r];
          return Wn(Z(n) ? uo(n) : [n], Li(t, 1));
        }
        var Hs = K(function (e, t) {
            return mu(e) ? Ai(e, Li(t, 1, mu, !0)) : [];
          }),
          Us = K(function (e, t) {
            var r = lc(t);
            return (mu(r) && (r = n), mu(e) ? Ai(e, Li(t, 1, mu, !0), J(r, 2)) : []);
          }),
          Ws = K(function (e, t) {
            var r = lc(t);
            return (mu(r) && (r = n), mu(e) ? Ai(e, Li(t, 1, mu, !0), n, r) : []);
          });
        function Gs(e, t, r) {
          var i = e == null ? 0 : e.length;
          return i ? ((t = r || t === n ? 1 : Q(t)), Fa(e, t < 0 ? 0 : t, i)) : [];
        }
        function Ks(e, t, r) {
          var i = e == null ? 0 : e.length;
          return i ? ((t = r || t === n ? 1 : Q(t)), (t = i - t), Fa(e, 0, t < 0 ? 0 : t)) : [];
        }
        function qs(e, t) {
          return e && e.length ? Ga(e, J(t, 3), !0, !0) : [];
        }
        function Js(e, t) {
          return e && e.length ? Ga(e, J(t, 3), !0) : [];
        }
        function Ys(e, t, n, r) {
          var i = e == null ? 0 : e.length;
          return i ? (n && typeof n != 'number' && ps(e, t, n) && ((n = 0), (r = i)), Fi(e, t, n, r)) : [];
        }
        function Xs(e, t, n) {
          var r = e == null ? 0 : e.length;
          if (!r) return -1;
          var i = n == null ? 0 : Q(n);
          return (i < 0 && (i = pn(r + i, 0)), Xn(e, J(t, 3), i));
        }
        function Zs(e, t, r) {
          var i = e == null ? 0 : e.length;
          if (!i) return -1;
          var a = i - 1;
          return (r !== n && ((a = Q(r)), (a = r < 0 ? pn(i + a, 0) : gn(a, i - 1))), Xn(e, J(t, 3), a, !0));
        }
        function Qs(e) {
          return e != null && e.length ? Li(e, 1) : [];
        }
        function $s(e) {
          return e != null && e.length ? Li(e, ue) : [];
        }
        function ec(e, t) {
          return e != null && e.length ? ((t = t === n ? 1 : Q(t)), Li(e, t)) : [];
        }
        function tc(e) {
          for (var t = -1, n = e == null ? 0 : e.length, r = {}; ++t < n; ) {
            var i = e[t];
            wi(r, i[0], i[1]);
          }
          return r;
        }
        function nc(e) {
          return e && e.length ? e[0] : n;
        }
        function rc(e, t, n) {
          var r = e == null ? 0 : e.length;
          if (!r) return -1;
          var i = n == null ? 0 : Q(n);
          return (i < 0 && (i = pn(r + i, 0)), Zn(e, t, i));
        }
        function ic(e) {
          return e != null && e.length ? Fa(e, 0, -1) : [];
        }
        var ac = K(function (e) {
            var t = N(e, Ya);
            return t.length && t[0] === e[0] ? Xi(t) : [];
          }),
          oc = K(function (e) {
            var t = lc(e),
              r = N(e, Ya);
            return (t === lc(r) ? (t = n) : r.pop(), r.length && r[0] === e[0] ? Xi(r, J(t, 2)) : []);
          }),
          sc = K(function (e) {
            var t = lc(e),
              r = N(e, Ya);
            return ((t = typeof t == 'function' ? t : n), t && r.pop(), r.length && r[0] === e[0] ? Xi(r, n, t) : []);
          });
        function cc(e, t) {
          return e == null ? '' : dn.call(e, t);
        }
        function lc(e) {
          var t = e == null ? 0 : e.length;
          return t ? e[t - 1] : n;
        }
        function uc(e, t, r) {
          var i = e == null ? 0 : e.length;
          if (!i) return -1;
          var a = i;
          return (
            r !== n && ((a = Q(r)), (a = a < 0 ? pn(i + a, 0) : gn(a, i - 1))),
            t === t ? Dr(e, t, a) : Xn(e, $n, a, !0)
          );
        }
        function dc(e, t) {
          return e && e.length ? ya(e, Q(t)) : n;
        }
        var fc = K(pc);
        function pc(e, t) {
          return e && e.length && t && t.length ? wa(e, t) : e;
        }
        function mc(e, t, n) {
          return e && e.length && t && t.length ? wa(e, t, J(n, 2)) : e;
        }
        function hc(e, t, r) {
          return e && e.length && t && t.length ? wa(e, t, n, r) : e;
        }
        var gc = Go(function (e, t) {
          var n = e == null ? 0 : e.length,
            r = Ti(e, t);
          return (
            Ta(
              e,
              N(t, function (e) {
                return fs(e, n) ? +e : e;
              }).sort(q)
            ),
            r
          );
        });
        function _c(e, t) {
          var n = [];
          if (!(e && e.length)) return n;
          var r = -1,
            i = [],
            a = e.length;
          for (t = J(t, 3); ++r < a; ) {
            var o = e[r];
            t(o, r, e) && (n.push(o), i.push(r));
          }
          return (Ta(e, i), n);
        }
        function vc(e) {
          return e == null ? e : Sn.call(e);
        }
        function yc(e, t, r) {
          var i = e == null ? 0 : e.length;
          return i
            ? (r && typeof r != 'number' && ps(e, t, r)
                ? ((t = 0), (r = i))
                : ((t = t == null ? 0 : Q(t)), (r = r === n ? i : Q(r))),
              Fa(e, t, r))
            : [];
        }
        function bc(e, t) {
          return La(e, t);
        }
        function xc(e, t, n) {
          return Ra(e, t, J(n, 2));
        }
        function Sc(e, t) {
          var n = e == null ? 0 : e.length;
          if (n) {
            var r = La(e, t);
            if (r < n && cu(e[r], t)) return r;
          }
          return -1;
        }
        function Cc(e, t) {
          return La(e, t, !0);
        }
        function wc(e, t, n) {
          return Ra(e, t, J(n, 2), !0);
        }
        function Tc(e, t) {
          if (e != null && e.length) {
            var n = La(e, t, !0) - 1;
            if (cu(e[n], t)) return n;
          }
          return -1;
        }
        function Ec(e) {
          return e && e.length ? za(e) : [];
        }
        function Dc(e, t) {
          return e && e.length ? za(e, J(t, 2)) : [];
        }
        function Oc(e) {
          var t = e == null ? 0 : e.length;
          return t ? Fa(e, 1, t) : [];
        }
        function kc(e, t, r) {
          return e && e.length ? ((t = r || t === n ? 1 : Q(t)), Fa(e, 0, t < 0 ? 0 : t)) : [];
        }
        function Ac(e, t, r) {
          var i = e == null ? 0 : e.length;
          return i ? ((t = r || t === n ? 1 : Q(t)), (t = i - t), Fa(e, t < 0 ? 0 : t, i)) : [];
        }
        function jc(e, t) {
          return e && e.length ? Ga(e, J(t, 3), !1, !0) : [];
        }
        function Mc(e, t) {
          return e && e.length ? Ga(e, J(t, 3)) : [];
        }
        var Nc = K(function (e) {
            return Ha(Li(e, 1, mu, !0));
          }),
          Pc = K(function (e) {
            var t = lc(e);
            return (mu(t) && (t = n), Ha(Li(e, 1, mu, !0), J(t, 2)));
          }),
          Fc = K(function (e) {
            var t = lc(e);
            return ((t = typeof t == 'function' ? t : n), Ha(Li(e, 1, mu, !0), n, t));
          });
        function Ic(e) {
          return e && e.length ? Ha(e) : [];
        }
        function Lc(e, t) {
          return e && e.length ? Ha(e, J(t, 2)) : [];
        }
        function Rc(e, t) {
          return ((t = typeof t == 'function' ? t : n), e && e.length ? Ha(e, n, t) : []);
        }
        function zc(e) {
          if (!(e && e.length)) return [];
          var t = 0;
          return (
            (e = Vn(e, function (e) {
              if (mu(e)) return ((t = pn(e.length, t)), !0);
            })),
            or(t, function (t) {
              return N(e, tr(t));
            })
          );
        }
        function Bc(e, t) {
          if (!(e && e.length)) return [];
          var r = zc(e);
          return t == null
            ? r
            : N(r, function (e) {
                return In(t, n, e);
              });
        }
        var Vc = K(function (e, t) {
            return mu(e) ? Ai(e, t) : [];
          }),
          Hc = K(function (e) {
            return qa(Vn(e, mu));
          }),
          Uc = K(function (e) {
            var t = lc(e);
            return (mu(t) && (t = n), qa(Vn(e, mu), J(t, 2)));
          }),
          Wc = K(function (e) {
            var t = lc(e);
            return ((t = typeof t == 'function' ? t : n), qa(Vn(e, mu), n, t));
          }),
          Gc = K(zc);
        function Kc(e, t) {
          return Ja(e || [], t || [], yi);
        }
        function qc(e, t) {
          return Ja(e || [], t || [], ja);
        }
        var Jc = K(function (e) {
          var t = e.length,
            r = t > 1 ? e[t - 1] : n;
          return ((r = typeof r == 'function' ? (e.pop(), r) : n), Bc(e, r));
        });
        function Yc(e) {
          var t = L(e);
          return ((t.__chain__ = !0), t);
        }
        function Xc(e, t) {
          return (t(e), e);
        }
        function Zc(e, t) {
          return t(e);
        }
        var Qc = Go(function (e) {
          var t = e.length,
            r = t ? e[0] : 0,
            i = this.__wrapped__,
            a = function (t) {
              return Ti(t, e);
            };
          return t > 1 || this.__actions__.length || !(i instanceof R) || !fs(r)
            ? this.thru(a)
            : ((i = i.slice(r, +r + +!!t)),
              i.__actions__.push({
                func: Zc,
                args: [a],
                thisArg: n
              }),
              new Ur(i, this.__chain__).thru(function (e) {
                return (t && !e.length && e.push(n), e);
              }));
        });
        function $c() {
          return Yc(this);
        }
        function el() {
          return new Ur(this.value(), this.__chain__);
        }
        function tl() {
          this.__values__ === n && (this.__values__ = Yu(this.value()));
          var e = this.__index__ >= this.__values__.length;
          return {
            done: e,
            value: e ? n : this.__values__[this.__index__++]
          };
        }
        function nl() {
          return this;
        }
        function rl(e) {
          for (var t, r = this; r instanceof Hr; ) {
            var i = Rs(r);
            ((i.__index__ = 0), (i.__values__ = n), t ? (a.__wrapped__ = i) : (t = i));
            var a = i;
            r = r.__wrapped__;
          }
          return ((a.__wrapped__ = e), t);
        }
        function il() {
          var e = this.__wrapped__;
          if (e instanceof R) {
            var t = e;
            return (
              this.__actions__.length && (t = new R(this)),
              (t = t.reverse()),
              t.__actions__.push({
                func: Zc,
                args: [vc],
                thisArg: n
              }),
              new Ur(t, this.__chain__)
            );
          }
          return this.thru(vc);
        }
        function al() {
          return Ka(this.__wrapped__, this.__actions__);
        }
        var ol = ho(function (e, t, n) {
          A.call(e, n) ? ++e[n] : wi(e, n, 1);
        });
        function sl(e, t, r) {
          var i = Z(e) ? Bn : Ni;
          return (r && ps(e, t, r) && (t = n), i(e, J(t, 3)));
        }
        function cl(e, t) {
          return (Z(e) ? Vn : Ii)(e, J(t, 3));
        }
        var ll = wo(Xs),
          ul = wo(Zs);
        function dl(e, t) {
          return Li(bl(e, t), 1);
        }
        function fl(e, t) {
          return Li(bl(e, t), ue);
        }
        function pl(e, t, r) {
          return ((r = r === n ? 1 : Q(r)), Li(bl(e, t), r));
        }
        function ml(e, t) {
          return (Z(e) ? Rn : ji)(e, J(t, 3));
        }
        function hl(e, t) {
          return (Z(e) ? zn : Mi)(e, J(t, 3));
        }
        var gl = ho(function (e, t, n) {
          A.call(e, n) ? e[n].push(t) : wi(e, n, [t]);
        });
        function _l(e, t, n, r) {
          ((e = pu(e) ? e : Hd(e)), (n = n && !r ? Q(n) : 0));
          var i = e.length;
          return (n < 0 && (n = pn(i + n, 0)), Vu(e) ? n <= i && e.indexOf(t, n) > -1 : !!i && Zn(e, t, n) > -1);
        }
        var vl = K(function (e, t, n) {
            var r = -1,
              i = typeof t == 'function',
              a = pu(e) ? E(e.length) : [];
            return (
              ji(e, function (e) {
                a[++r] = i ? In(t, e, n) : Qi(e, t, n);
              }),
              a
            );
          }),
          yl = ho(function (e, t, n) {
            wi(e, n, t);
          });
        function bl(e, t) {
          return (Z(e) ? N : ma)(e, J(t, 3));
        }
        function xl(e, t, r, i) {
          return e == null
            ? []
            : (Z(t) || (t = t == null ? [] : [t]), (r = i ? n : r), Z(r) || (r = r == null ? [] : [r]), ba(e, t, r));
        }
        var Sl = ho(
          function (e, t, n) {
            e[+!n].push(t);
          },
          function () {
            return [[], []];
          }
        );
        function Cl(e, t, n) {
          var r = Z(e) ? P : rr,
            i = arguments.length < 3;
          return r(e, J(t, 4), n, i, ji);
        }
        function wl(e, t, n) {
          var r = Z(e) ? Gn : rr,
            i = arguments.length < 3;
          return r(e, J(t, 4), n, i, Mi);
        }
        function Tl(e, t) {
          return (Z(e) ? Vn : Ii)(e, Gl(J(t, 3)));
        }
        function El(e) {
          return (Z(e) ? gi : ka)(e);
        }
        function Dl(e, t, r) {
          return ((t = (r ? ps(e, t, r) : t === n) ? 1 : Q(t)), (Z(e) ? W : Aa)(e, t));
        }
        function Ol(e) {
          return (Z(e) ? _i : Pa)(e);
        }
        function kl(e) {
          if (e == null) return 0;
          if (pu(e)) return Vu(e) ? Or(e) : e.length;
          var t = rs(e);
          return t == De || t == Pe ? e.size : da(e).length;
        }
        function Al(e, t, r) {
          var i = Z(e) ? Kn : Ia;
          return (r && ps(e, t, r) && (t = n), i(e, J(t, 3)));
        }
        var jl = K(function (e, t) {
            if (e == null) return [];
            var n = t.length;
            return (
              n > 1 && ps(e, t[0], t[1]) ? (t = []) : n > 2 && ps(t[0], t[1], t[2]) && (t = [t[0]]),
              ba(e, Li(t, 1), [])
            );
          }),
          Ml =
            tn ||
            function () {
              return wn.Date.now();
            };
        function Nl(e, t) {
          if (typeof t != 'function') throw new At(o);
          return (
            (e = Q(e)),
            function () {
              if (--e < 1) return t.apply(this, arguments);
            }
          );
        }
        function Pl(e, t, r) {
          return ((t = r ? n : t), (t = e && t == null ? e.length : t), Ro(e, ee, n, n, n, n, t));
        }
        function Fl(e, t) {
          var r;
          if (typeof t != 'function') throw new At(o);
          return (
            (e = Q(e)),
            function () {
              return (--e > 0 && (r = t.apply(this, arguments)), e <= 1 && (t = n), r);
            }
          );
        }
        var Il = K(function (e, t, n) {
            var r = _;
            if (n.length) {
              var i = Cr(n, Xo(Il));
              r |= S;
            }
            return Ro(e, r, t, n, i);
          }),
          Ll = K(function (e, t, n) {
            var r = _ | v;
            if (n.length) {
              var i = Cr(n, Xo(Ll));
              r |= S;
            }
            return Ro(t, r, e, n, i);
          });
        function Rl(e, t, r) {
          t = r ? n : t;
          var i = Ro(e, b, n, n, n, n, n, t);
          return ((i.placeholder = Rl.placeholder), i);
        }
        function zl(e, t, r) {
          t = r ? n : t;
          var i = Ro(e, x, n, n, n, n, n, t);
          return ((i.placeholder = zl.placeholder), i);
        }
        function Bl(e, t, r) {
          var i,
            a,
            s,
            c,
            l,
            u,
            d = 0,
            f = !1,
            p = !1,
            m = !0;
          if (typeof e != 'function') throw new At(o);
          ((t = Qu(t) || 0),
            Du(r) &&
              ((f = !!r.leading),
              (p = 'maxWait' in r),
              (s = p ? pn(Qu(r.maxWait) || 0, t) : s),
              (m = 'trailing' in r ? !!r.trailing : m)));
          function h(t) {
            var r = i,
              o = a;
            return ((i = a = n), (d = t), (c = e.apply(o, r)), c);
          }
          function g(e) {
            return ((d = e), (l = ks(y, t)), f ? h(e) : c);
          }
          function _(e) {
            var n = e - u,
              r = e - d,
              i = t - n;
            return p ? gn(i, s - r) : i;
          }
          function v(e) {
            var r = e - u,
              i = e - d;
            return u === n || r >= t || r < 0 || (p && i >= s);
          }
          function y() {
            var e = Ml();
            if (v(e)) return b(e);
            l = ks(y, _(e));
          }
          function b(e) {
            return ((l = n), m && i ? h(e) : ((i = a = n), c));
          }
          function x() {
            (l !== n && eo(l), (d = 0), (i = u = a = l = n));
          }
          function S() {
            return l === n ? c : b(Ml());
          }
          function C() {
            var e = Ml(),
              r = v(e);
            if (((i = arguments), (a = this), (u = e), r)) {
              if (l === n) return g(u);
              if (p) return (eo(l), (l = ks(y, t)), h(u));
            }
            return (l === n && (l = ks(y, t)), c);
          }
          return ((C.cancel = x), (C.flush = S), C);
        }
        var Vl = K(function (e, t) {
            return ki(e, 1, t);
          }),
          Hl = K(function (e, t, n) {
            return ki(e, Qu(t) || 0, n);
          });
        function Ul(e) {
          return Ro(e, ne);
        }
        function Wl(e, t) {
          if (typeof e != 'function' || (t != null && typeof t != 'function')) throw new At(o);
          var n = function () {
            var r = arguments,
              i = t ? t.apply(this, r) : r[0],
              a = n.cache;
            if (a.has(i)) return a.get(i);
            var o = e.apply(this, r);
            return ((n.cache = a.set(i, o) || a), o);
          };
          return ((n.cache = new (Wl.Cache || ni)()), n);
        }
        Wl.Cache = ni;
        function Gl(e) {
          if (typeof e != 'function') throw new At(o);
          return function () {
            var t = arguments;
            switch (t.length) {
              case 0:
                return !e.call(this);
              case 1:
                return !e.call(this, t[0]);
              case 2:
                return !e.call(this, t[0], t[1]);
              case 3:
                return !e.call(this, t[0], t[1], t[2]);
            }
            return !e.apply(this, t);
          };
        }
        function Kl(e) {
          return Fl(2, e);
        }
        var ql = Qa(function (e, t) {
            t = t.length == 1 && Z(t[0]) ? N(t[0], I(J())) : N(Li(t, 1), I(J()));
            var n = t.length;
            return K(function (r) {
              for (var i = -1, a = gn(r.length, n); ++i < a; ) r[i] = t[i].call(this, r[i]);
              return In(e, this, r);
            });
          }),
          Jl = K(function (e, t) {
            return Ro(e, S, n, t, Cr(t, Xo(Jl)));
          }),
          Yl = K(function (e, t) {
            return Ro(e, C, n, t, Cr(t, Xo(Yl)));
          }),
          Xl = Go(function (e, t) {
            return Ro(e, te, n, n, n, t);
          });
        function Zl(e, t) {
          if (typeof e != 'function') throw new At(o);
          return ((t = t === n ? t : Q(t)), K(e, t));
        }
        function Ql(e, t) {
          if (typeof e != 'function') throw new At(o);
          return (
            (t = t == null ? 0 : pn(Q(t), 0)),
            K(function (n) {
              var r = n[t],
                i = $a(n, 0, t);
              return (r && Wn(i, r), In(e, this, i));
            })
          );
        }
        function $l(e, t, n) {
          var r = !0,
            i = !0;
          if (typeof e != 'function') throw new At(o);
          return (
            Du(n) && ((r = 'leading' in n ? !!n.leading : r), (i = 'trailing' in n ? !!n.trailing : i)),
            Bl(e, t, {
              leading: r,
              maxWait: t,
              trailing: i
            })
          );
        }
        function eu(e) {
          return Pl(e, 1);
        }
        function tu(e, t) {
          return Jl(Xa(t), e);
        }
        function nu() {
          if (!arguments.length) return [];
          var e = arguments[0];
          return Z(e) ? e : [e];
        }
        function ru(e) {
          return Di(e, m);
        }
        function iu(e, t) {
          return ((t = typeof t == 'function' ? t : n), Di(e, m, t));
        }
        function au(e) {
          return Di(e, f | m);
        }
        function ou(e, t) {
          return ((t = typeof t == 'function' ? t : n), Di(e, f | m, t));
        }
        function su(e, t) {
          return t == null || G(e, t, Cd(t));
        }
        function cu(e, t) {
          return e === t || (e !== e && t !== t);
        }
        var lu = No(Ki),
          uu = No(function (e, t) {
            return e >= t;
          }),
          du = $i(
            (function () {
              return arguments;
            })()
          )
            ? $i
            : function (e) {
                return Ou(e) && A.call(e, 'callee') && !Jt.call(e, 'callee');
              },
          Z = E.isArray,
          fu = An ? I(An) : ea;
        function pu(e) {
          return e != null && Eu(e.length) && !wu(e);
        }
        function mu(e) {
          return Ou(e) && pu(e);
        }
        function hu(e) {
          return e === !0 || e === !1 || (Ou(e) && Gi(e) == xe);
        }
        var gu = sn || Xf,
          _u = jn ? I(jn) : ta;
        function vu(e) {
          return Ou(e) && e.nodeType === 1 && !Lu(e);
        }
        function yu(e) {
          if (e == null) return !0;
          if (pu(e) && (Z(e) || typeof e == 'string' || typeof e.splice == 'function' || gu(e) || Uu(e) || du(e)))
            return !e.length;
          var t = rs(e);
          if (t == De || t == Pe) return !e.size;
          if (vs(e)) return !da(e).length;
          for (var n in e) if (A.call(e, n)) return !1;
          return !0;
        }
        function bu(e, t) {
          return na(e, t);
        }
        function xu(e, t, r) {
          r = typeof r == 'function' ? r : n;
          var i = r ? r(e, t) : n;
          return i === n ? na(e, t, n, r) : !!i;
        }
        function Su(e) {
          if (!Ou(e)) return !1;
          var t = Gi(e);
          return t == we || t == Ce || (typeof e.message == 'string' && typeof e.name == 'string' && !Lu(e));
        }
        function Cu(e) {
          return typeof e == 'number' && un(e);
        }
        function wu(e) {
          if (!Du(e)) return !1;
          var t = Gi(e);
          return t == Te || t == Ee || t == be || t == Me;
        }
        function Tu(e) {
          return typeof e == 'number' && e == Q(e);
        }
        function Eu(e) {
          return typeof e == 'number' && e > -1 && e % 1 == 0 && e <= de;
        }
        function Du(e) {
          var t = typeof e;
          return e != null && (t == 'object' || t == 'function');
        }
        function Ou(e) {
          return typeof e == 'object' && !!e;
        }
        var ku = Mn ? I(Mn) : ia;
        function Au(e, t) {
          return e === t || aa(e, t, Qo(t));
        }
        function ju(e, t, r) {
          return ((r = typeof r == 'function' ? r : n), aa(e, t, Qo(t), r));
        }
        function Mu(e) {
          return Iu(e) && e != +e;
        }
        function Nu(e) {
          if (Y(e)) throw new Et(a);
          return oa(e);
        }
        function Pu(e) {
          return e === null;
        }
        function Fu(e) {
          return e == null;
        }
        function Iu(e) {
          return typeof e == 'number' || (Ou(e) && Gi(e) == Oe);
        }
        function Lu(e) {
          if (!Ou(e) || Gi(e) != Ae) return !1;
          var t = Kt(e);
          if (t === null) return !0;
          var n = A.call(t, 'constructor') && t.constructor;
          return typeof n == 'function' && n instanceof n && Ft.call(n) == zt;
        }
        var Ru = Nn ? I(Nn) : sa;
        function zu(e) {
          return Tu(e) && e >= -de && e <= de;
        }
        var Bu = Pn ? I(Pn) : ca;
        function Vu(e) {
          return typeof e == 'string' || (!Z(e) && Ou(e) && Gi(e) == Fe);
        }
        function Hu(e) {
          return typeof e == 'symbol' || (Ou(e) && Gi(e) == Ie);
        }
        var Uu = Fn ? I(Fn) : la;
        function Wu(e) {
          return e === n;
        }
        function Gu(e) {
          return Ou(e) && rs(e) == Re;
        }
        function Ku(e) {
          return Ou(e) && Gi(e) == ze;
        }
        var qu = No(pa),
          Ju = No(function (e, t) {
            return e <= t;
          });
        function Yu(e) {
          if (!e) return [];
          if (pu(e)) return Vu(e) ? kr(e) : uo(e);
          if (Zt && e[Zt]) return br(e[Zt]());
          var t = rs(e);
          return (t == De ? xr : t == Pe ? wr : Hd)(e);
        }
        function Xu(e) {
          return e ? ((e = Qu(e)), e === ue || e === -ue ? (e < 0 ? -1 : 1) * fe : e === e ? e : 0) : e === 0 ? e : 0;
        }
        function Q(e) {
          var t = Xu(e),
            n = t % 1;
          return t === t ? (n ? t - n : t) : 0;
        }
        function Zu(e) {
          return e ? Ei(Q(e), 0, me) : 0;
        }
        function Qu(e) {
          if (typeof e == 'number') return e;
          if (Hu(e)) return pe;
          if (Du(e)) {
            var t = typeof e.valueOf == 'function' ? e.valueOf() : e;
            e = Du(t) ? t + '' : t;
          }
          if (typeof e != 'string') return e === 0 ? e : +e;
          e = cr(e);
          var n = yt.test(e);
          return n || xt.test(e) ? xn(e.slice(2), n ? 2 : 8) : D.test(e) ? pe : +e;
        }
        function $u(e) {
          return fo(e, wd(e));
        }
        function ed(e) {
          return e ? Ei(Q(e), -de, de) : e === 0 ? e : 0;
        }
        function $(e) {
          return e == null ? '' : Va(e);
        }
        var td = go(function (e, t) {
            if (vs(t) || pu(t)) {
              fo(t, Cd(t), e);
              return;
            }
            for (var n in t) A.call(t, n) && yi(e, n, t[n]);
          }),
          nd = go(function (e, t) {
            fo(t, wd(t), e);
          }),
          rd = go(function (e, t, n, r) {
            fo(t, wd(t), e, r);
          }),
          id = go(function (e, t, n, r) {
            fo(t, Cd(t), e, r);
          }),
          ad = Go(Ti);
        function od(e, t) {
          var n = Vr(e);
          return t == null ? n : Si(n, t);
        }
        var sd = K(function (e, t) {
            e = O(e);
            var r = -1,
              i = t.length,
              a = i > 2 ? t[2] : n;
            for (a && ps(t[0], t[1], a) && (i = 1); ++r < i; )
              for (var o = t[r], s = wd(o), c = -1, l = s.length; ++c < l; ) {
                var u = s[c],
                  d = e[u];
                (d === n || (cu(d, Nt[u]) && !A.call(e, u))) && (e[u] = o[u]);
              }
            return e;
          }),
          cd = K(function (e) {
            return (e.push(n, Bo), In(Od, n, e));
          });
        function ld(e, t) {
          return Yn(e, J(t, 3), Bi);
        }
        function ud(e, t) {
          return Yn(e, J(t, 3), Vi);
        }
        function dd(e, t) {
          return e == null ? e : Ri(e, J(t, 3), wd);
        }
        function fd(e, t) {
          return e == null ? e : zi(e, J(t, 3), wd);
        }
        function pd(e, t) {
          return e && Bi(e, J(t, 3));
        }
        function md(e, t) {
          return e && Vi(e, J(t, 3));
        }
        function hd(e) {
          return e == null ? [] : Hi(e, Cd(e));
        }
        function gd(e) {
          return e == null ? [] : Hi(e, wd(e));
        }
        function _d(e, t, r) {
          var i = e == null ? n : Ui(e, t);
          return i === n ? r : i;
        }
        function vd(e, t) {
          return e != null && os(e, t, qi);
        }
        function yd(e, t) {
          return e != null && os(e, t, Ji);
        }
        var bd = Do(function (e, t, n) {
            (t != null && typeof t.toString != 'function' && (t = Rt.call(t)), (e[t] = n));
          }, Of(Mf)),
          xd = Do(function (e, t, n) {
            (t != null && typeof t.toString != 'function' && (t = Rt.call(t)),
              A.call(e, t) ? e[t].push(n) : (e[t] = [n]));
          }, J),
          Sd = K(Qi);
        function Cd(e) {
          return pu(e) ? hi(e) : da(e);
        }
        function wd(e) {
          return pu(e) ? hi(e, !0) : fa(e);
        }
        function Td(e, t) {
          var n = {};
          return (
            (t = J(t, 3)),
            Bi(e, function (e, r, i) {
              wi(n, t(e, r, i), e);
            }),
            n
          );
        }
        function Ed(e, t) {
          var n = {};
          return (
            (t = J(t, 3)),
            Bi(e, function (e, r, i) {
              wi(n, r, t(e, r, i));
            }),
            n
          );
        }
        var Dd = go(function (e, t, n) {
            _a(e, t, n);
          }),
          Od = go(function (e, t, n, r) {
            _a(e, t, n, r);
          }),
          kd = Go(function (e, t) {
            var n = {};
            if (e == null) return n;
            var r = !1;
            ((t = N(t, function (t) {
              return ((t = Za(t, e)), (r ||= t.length > 1), t);
            })),
              fo(e, qo(e), n),
              r && (n = Di(n, f | p | m, Vo)));
            for (var i = t.length; i--; ) Ua(n, t[i]);
            return n;
          });
        function Ad(e, t) {
          return Md(e, Gl(J(t)));
        }
        var jd = Go(function (e, t) {
          return e == null ? {} : xa(e, t);
        });
        function Md(e, t) {
          if (e == null) return {};
          var n = N(qo(e), function (e) {
            return [e];
          });
          return (
            (t = J(t)),
            Sa(e, n, function (e, n) {
              return t(e, n[0]);
            })
          );
        }
        function Nd(e, t, r) {
          t = Za(t, e);
          var i = -1,
            a = t.length;
          for (a || ((a = 1), (e = n)); ++i < a; ) {
            var o = e == null ? n : e[Fs(t[i])];
            (o === n && ((i = a), (o = r)), (e = wu(o) ? o.call(e) : o));
          }
          return e;
        }
        function Pd(e, t, n) {
          return e == null ? e : ja(e, t, n);
        }
        function Fd(e, t, r, i) {
          return ((i = typeof i == 'function' ? i : n), e == null ? e : ja(e, t, r, i));
        }
        var Id = Lo(Cd),
          Ld = Lo(wd);
        function Rd(e, t, n) {
          var r = Z(e),
            i = r || gu(e) || Uu(e);
          if (((t = J(t, 4)), n == null)) {
            var a = e && e.constructor;
            n = i ? (r ? new a() : []) : Du(e) && wu(a) ? Vr(Kt(e)) : {};
          }
          return (
            (i ? Rn : Bi)(e, function (e, r, i) {
              return t(n, e, r, i);
            }),
            n
          );
        }
        function zd(e, t) {
          return e == null ? !0 : Ua(e, t);
        }
        function Bd(e, t, n) {
          return e == null ? e : Wa(e, t, Xa(n));
        }
        function Vd(e, t, r, i) {
          return ((i = typeof i == 'function' ? i : n), e == null ? e : Wa(e, t, Xa(r), i));
        }
        function Hd(e) {
          return e == null ? [] : lr(e, Cd(e));
        }
        function Ud(e) {
          return e == null ? [] : lr(e, wd(e));
        }
        function Wd(e, t, r) {
          return (
            r === n && ((r = t), (t = n)),
            r !== n && ((r = Qu(r)), (r = r === r ? r : 0)),
            t !== n && ((t = Qu(t)), (t = t === t ? t : 0)),
            Ei(Qu(e), t, r)
          );
        }
        function Gd(e, t, r) {
          return ((t = Xu(t)), r === n ? ((r = t), (t = 0)) : (r = Xu(r)), (e = Qu(e)), Yi(e, t, r));
        }
        function Kd(e, t, r) {
          if (
            (r && typeof r != 'boolean' && ps(e, t, r) && (t = r = n),
            r === n && (typeof t == 'boolean' ? ((r = t), (t = n)) : typeof e == 'boolean' && ((r = e), (e = n))),
            e === n && t === n ? ((e = 0), (t = 1)) : ((e = Xu(e)), t === n ? ((t = e), (e = 0)) : (t = Xu(t))),
            e > t)
          ) {
            var i = e;
            ((e = t), (t = i));
          }
          if (r || e % 1 || t % 1) {
            var a = yn();
            return gn(e + a * (t - e + bn('1e-' + ((a + '').length - 1))), t);
          }
          return Ea(e, t);
        }
        var qd = xo(function (e, t, n) {
          return ((t = t.toLowerCase()), e + (n ? Jd(t) : t));
        });
        function Jd(e) {
          return Sf($(e).toLowerCase());
        }
        function Yd(e) {
          return ((e = $(e)), e && e.replace(Ct, mr).replace(ln, ''));
        }
        function Xd(e, t, r) {
          ((e = $(e)), (t = Va(t)));
          var i = e.length;
          r = r === n ? i : Ei(Q(r), 0, i);
          var a = r;
          return ((r -= t.length), r >= 0 && e.slice(r, a) == t);
        }
        function Zd(e) {
          return ((e = $(e)), e && tt.test(e) ? e.replace($e, hr) : e);
        }
        function Qd(e) {
          return ((e = $(e)), e && lt.test(e) ? e.replace(ct, '\\$&') : e);
        }
        var $d = xo(function (e, t, n) {
            return e + (n ? '-' : '') + t.toLowerCase();
          }),
          ef = xo(function (e, t, n) {
            return e + (n ? ' ' : '') + t.toLowerCase();
          }),
          tf = bo('toLowerCase');
        function nf(e, t, n) {
          ((e = $(e)), (t = Q(t)));
          var r = t ? Or(e) : 0;
          if (!t || r >= t) return e;
          var i = (t - r) / 2;
          return Ao(an(i), n) + e + Ao(rn(i), n);
        }
        function rf(e, t, n) {
          ((e = $(e)), (t = Q(t)));
          var r = t ? Or(e) : 0;
          return t && r < t ? e + Ao(t - r, n) : e;
        }
        function af(e, t, n) {
          ((e = $(e)), (t = Q(t)));
          var r = t ? Or(e) : 0;
          return t && r < t ? Ao(t - r, n) + e : e;
        }
        function of(e, t, n) {
          return (n || t == null ? (t = 0) : (t &&= +t), vn($(e).replace(ut, ''), t || 0));
        }
        function sf(e, t, r) {
          return ((t = (r ? ps(e, t, r) : t === n) ? 1 : Q(t)), Oa($(e), t));
        }
        function cf() {
          var e = arguments,
            t = $(e[0]);
          return e.length < 3 ? t : t.replace(e[1], e[2]);
        }
        var lf = xo(function (e, t, n) {
          return e + (n ? '_' : '') + t.toLowerCase();
        });
        function uf(e, t, r) {
          return (
            r && typeof r != 'number' && ps(e, t, r) && (t = r = n),
            (r = r === n ? me : r >>> 0),
            r
              ? ((e = $(e)),
                e && (typeof t == 'string' || (t != null && !Ru(t))) && ((t = Va(t)), !t && vr(e))
                  ? $a(kr(e), 0, r)
                  : e.split(t, r))
              : []
          );
        }
        var df = xo(function (e, t, n) {
          return e + (n ? ' ' : '') + Sf(t);
        });
        function ff(e, t, n) {
          return ((e = $(e)), (n = n == null ? 0 : Ei(Q(n), 0, e.length)), (t = Va(t)), e.slice(n, n + t.length) == t);
        }
        function pf(e, t, r) {
          var i = L.templateSettings;
          (r && ps(e, t, r) && (t = n), (e = $(e)), (t = id({}, t, i, zo)));
          var a = id({}, t.imports, i.imports, zo),
            o = Cd(a),
            l = lr(a, o);
          Rn(o, function (e) {
            if (ht.test(e)) throw new Et(c);
          });
          var u,
            d,
            f = 0,
            p = t.interpolate || wt,
            m = "__p += '",
            h = k(
              (t.escape || wt).source +
                '|' +
                p.source +
                '|' +
                (p === it ? _t : wt).source +
                '|' +
                (t.evaluate || wt).source +
                '|$',
              'g'
            ),
            g =
              '//# sourceURL=' +
              (A.call(t, 'sourceURL')
                ? (t.sourceURL + '').replace(/\s/g, ' ')
                : 'lodash.templateSources[' + ++hn + ']') +
              '\n';
          (e.replace(h, function (t, n, r, i, a, o) {
            return (
              (r ||= i),
              (m += e.slice(f, o).replace(Tt, gr)),
              n && ((u = !0), (m += "' +\n__e(" + n + ") +\n'")),
              a && ((d = !0), (m += "';\n" + a + ";\n__p += '")),
              r && (m += "' +\n((__t = (" + r + ")) == null ? '' : __t) +\n'"),
              (f = o + t.length),
              t
            );
          }),
            (m += "';\n"));
          var _ = A.call(t, 'variable') && t.variable;
          if (!_) m = 'with (obj) {\n' + m + '\n}\n';
          else if (ht.test(_)) throw new Et(s);
          ((m = (d ? m.replace(Xe, '') : m).replace(T, '$1').replace(Ze, '$1;')),
            (m =
              'function(' +
              (_ || 'obj') +
              ') {\n' +
              (_ ? '' : 'obj || (obj = {});\n') +
              "var __t, __p = ''" +
              (u ? ', __e = _.escape' : '') +
              (d ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ';\n') +
              m +
              'return __p\n}'));
          var v = wf(function () {
            return Dt(o, g + 'return ' + m).apply(n, l);
          });
          if (((v.source = m), Su(v))) throw v;
          return v;
        }
        function mf(e) {
          return $(e).toLowerCase();
        }
        function hf(e) {
          return $(e).toUpperCase();
        }
        function gf(e, t, r) {
          if (((e = $(e)), e && (r || t === n))) return cr(e);
          if (!e || !(t = Va(t))) return e;
          var i = kr(e),
            a = kr(t);
          return $a(i, dr(i, a), fr(i, a) + 1).join('');
        }
        function _f(e, t, r) {
          if (((e = $(e)), e && (r || t === n))) return e.slice(0, Ar(e) + 1);
          if (!e || !(t = Va(t))) return e;
          var i = kr(e);
          return $a(i, 0, fr(i, kr(t)) + 1).join('');
        }
        function vf(e, t, r) {
          if (((e = $(e)), e && (r || t === n))) return e.replace(ut, '');
          if (!e || !(t = Va(t))) return e;
          var i = kr(e);
          return $a(i, dr(i, kr(t))).join('');
        }
        function yf(e, t) {
          var r = re,
            i = ie;
          if (Du(t)) {
            var a = 'separator' in t ? t.separator : a;
            ((r = 'length' in t ? Q(t.length) : r), (i = 'omission' in t ? Va(t.omission) : i));
          }
          e = $(e);
          var o = e.length;
          if (vr(e)) {
            var s = kr(e);
            o = s.length;
          }
          if (r >= o) return e;
          var c = r - Or(i);
          if (c < 1) return i;
          var l = s ? $a(s, 0, c).join('') : e.slice(0, c);
          if (a === n) return l + i;
          if ((s && (c += l.length - c), Ru(a))) {
            if (e.slice(c).search(a)) {
              var u,
                d = l;
              for (a.global || (a = k(a.source, $(vt.exec(a)) + 'g')), a.lastIndex = 0; (u = a.exec(d)); )
                var f = u.index;
              l = l.slice(0, f === n ? c : f);
            }
          } else if (e.indexOf(Va(a), c) != c) {
            var p = l.lastIndexOf(a);
            p > -1 && (l = l.slice(0, p));
          }
          return l + i;
        }
        function bf(e) {
          return ((e = $(e)), e && et.test(e) ? e.replace(Qe, jr) : e);
        }
        var xf = xo(function (e, t, n) {
            return e + (n ? ' ' : '') + t.toUpperCase();
          }),
          Sf = bo('toUpperCase');
        function Cf(e, t, r) {
          return ((e = $(e)), (t = r ? n : t), t === n ? (yr(e) ? Pr(e) : Jn(e)) : e.match(t) || []);
        }
        var wf = K(function (e, t) {
            try {
              return In(e, n, t);
            } catch (e) {
              return Su(e) ? e : new Et(e);
            }
          }),
          Tf = Go(function (e, t) {
            return (
              Rn(t, function (t) {
                ((t = Fs(t)), wi(e, t, Il(e[t], e)));
              }),
              e
            );
          });
        function Ef(e) {
          var t = e == null ? 0 : e.length,
            n = J();
          return (
            (e = t
              ? N(e, function (e) {
                  if (typeof e[1] != 'function') throw new At(o);
                  return [n(e[0]), e[1]];
                })
              : []),
            K(function (n) {
              for (var r = -1; ++r < t; ) {
                var i = e[r];
                if (In(i[0], this, n)) return In(i[1], this, n);
              }
            })
          );
        }
        function Df(e) {
          return Oi(Di(e, f));
        }
        function Of(e) {
          return function () {
            return e;
          };
        }
        function kf(e, t) {
          return e == null || e !== e ? t : e;
        }
        var Af = To(),
          jf = To(!0);
        function Mf(e) {
          return e;
        }
        function Nf(e) {
          return ua(typeof e == 'function' ? e : Di(e, f));
        }
        function Pf(e) {
          return ha(Di(e, f));
        }
        function Ff(e, t) {
          return ga(e, Di(t, f));
        }
        var If = K(function (e, t) {
            return function (n) {
              return Qi(n, e, t);
            };
          }),
          Lf = K(function (e, t) {
            return function (n) {
              return Qi(e, n, t);
            };
          });
        function Rf(e, t, n) {
          var r = Cd(t),
            i = Hi(t, r);
          n == null && !(Du(t) && (i.length || !r.length)) && ((n = t), (t = e), (e = this), (i = Hi(t, Cd(t))));
          var a = !(Du(n) && 'chain' in n) || !!n.chain,
            o = wu(e);
          return (
            Rn(i, function (n) {
              var r = t[n];
              ((e[n] = r),
                o &&
                  (e.prototype[n] = function () {
                    var t = this.__chain__;
                    if (a || t) {
                      var n = e(this.__wrapped__);
                      return (
                        (n.__actions__ = uo(this.__actions__)).push({
                          func: r,
                          args: arguments,
                          thisArg: e
                        }),
                        (n.__chain__ = t),
                        n
                      );
                    }
                    return r.apply(e, Wn([this.value()], arguments));
                  }));
            }),
            e
          );
        }
        function zf() {
          return (wn._ === this && (wn._ = Bt), this);
        }
        function Bf() {}
        function Vf(e) {
          return (
            (e = Q(e)),
            K(function (t) {
              return ya(t, e);
            })
          );
        }
        var Hf = ko(N),
          Uf = ko(Bn),
          Wf = ko(Kn);
        function Gf(e) {
          return ms(e) ? tr(Fs(e)) : Ca(e);
        }
        function Kf(e) {
          return function (t) {
            return e == null ? n : Ui(e, t);
          };
        }
        var qf = Mo(),
          Jf = Mo(!0);
        function Yf() {
          return [];
        }
        function Xf() {
          return !1;
        }
        function Zf() {
          return {};
        }
        function Qf() {
          return '';
        }
        function $f() {
          return !0;
        }
        function ep(e, t) {
          if (((e = Q(e)), e < 1 || e > de)) return [];
          var n = me,
            r = gn(e, me);
          ((t = J(t)), (e -= me));
          for (var i = or(r, t); ++n < e; ) t(n);
          return i;
        }
        function tp(e) {
          return Z(e) ? N(e, Fs) : Hu(e) ? [e] : uo(Ps($(e)));
        }
        function np(e) {
          var t = ++It;
          return $(e) + t;
        }
        var rp = Oo(function (e, t) {
            return e + t;
          }, 0),
          ip = Fo('ceil'),
          ap = Oo(function (e, t) {
            return e / t;
          }, 1),
          op = Fo('floor');
        function sp(e) {
          return e && e.length ? Pi(e, Mf, Ki) : n;
        }
        function cp(e, t) {
          return e && e.length ? Pi(e, J(t, 2), Ki) : n;
        }
        function lp(e) {
          return er(e, Mf);
        }
        function up(e, t) {
          return er(e, J(t, 2));
        }
        function dp(e) {
          return e && e.length ? Pi(e, Mf, pa) : n;
        }
        function fp(e, t) {
          return e && e.length ? Pi(e, J(t, 2), pa) : n;
        }
        var pp = Oo(function (e, t) {
            return e * t;
          }, 1),
          mp = Fo('round'),
          hp = Oo(function (e, t) {
            return e - t;
          }, 0);
        function gp(e) {
          return e && e.length ? ar(e, Mf) : 0;
        }
        function _p(e, t) {
          return e && e.length ? ar(e, J(t, 2)) : 0;
        }
        return (
          (L.after = Nl),
          (L.ary = Pl),
          (L.assign = td),
          (L.assignIn = nd),
          (L.assignInWith = rd),
          (L.assignWith = id),
          (L.at = ad),
          (L.before = Fl),
          (L.bind = Il),
          (L.bindAll = Tf),
          (L.bindKey = Ll),
          (L.castArray = nu),
          (L.chain = Yc),
          (L.chunk = zs),
          (L.compact = Bs),
          (L.concat = Vs),
          (L.cond = Ef),
          (L.conforms = Df),
          (L.constant = Of),
          (L.countBy = ol),
          (L.create = od),
          (L.curry = Rl),
          (L.curryRight = zl),
          (L.debounce = Bl),
          (L.defaults = sd),
          (L.defaultsDeep = cd),
          (L.defer = Vl),
          (L.delay = Hl),
          (L.difference = Hs),
          (L.differenceBy = Us),
          (L.differenceWith = Ws),
          (L.drop = Gs),
          (L.dropRight = Ks),
          (L.dropRightWhile = qs),
          (L.dropWhile = Js),
          (L.fill = Ys),
          (L.filter = cl),
          (L.flatMap = dl),
          (L.flatMapDeep = fl),
          (L.flatMapDepth = pl),
          (L.flatten = Qs),
          (L.flattenDeep = $s),
          (L.flattenDepth = ec),
          (L.flip = Ul),
          (L.flow = Af),
          (L.flowRight = jf),
          (L.fromPairs = tc),
          (L.functions = hd),
          (L.functionsIn = gd),
          (L.groupBy = gl),
          (L.initial = ic),
          (L.intersection = ac),
          (L.intersectionBy = oc),
          (L.intersectionWith = sc),
          (L.invert = bd),
          (L.invertBy = xd),
          (L.invokeMap = vl),
          (L.iteratee = Nf),
          (L.keyBy = yl),
          (L.keys = Cd),
          (L.keysIn = wd),
          (L.map = bl),
          (L.mapKeys = Td),
          (L.mapValues = Ed),
          (L.matches = Pf),
          (L.matchesProperty = Ff),
          (L.memoize = Wl),
          (L.merge = Dd),
          (L.mergeWith = Od),
          (L.method = If),
          (L.methodOf = Lf),
          (L.mixin = Rf),
          (L.negate = Gl),
          (L.nthArg = Vf),
          (L.omit = kd),
          (L.omitBy = Ad),
          (L.once = Kl),
          (L.orderBy = xl),
          (L.over = Hf),
          (L.overArgs = ql),
          (L.overEvery = Uf),
          (L.overSome = Wf),
          (L.partial = Jl),
          (L.partialRight = Yl),
          (L.partition = Sl),
          (L.pick = jd),
          (L.pickBy = Md),
          (L.property = Gf),
          (L.propertyOf = Kf),
          (L.pull = fc),
          (L.pullAll = pc),
          (L.pullAllBy = mc),
          (L.pullAllWith = hc),
          (L.pullAt = gc),
          (L.range = qf),
          (L.rangeRight = Jf),
          (L.rearg = Xl),
          (L.reject = Tl),
          (L.remove = _c),
          (L.rest = Zl),
          (L.reverse = vc),
          (L.sampleSize = Dl),
          (L.set = Pd),
          (L.setWith = Fd),
          (L.shuffle = Ol),
          (L.slice = yc),
          (L.sortBy = jl),
          (L.sortedUniq = Ec),
          (L.sortedUniqBy = Dc),
          (L.split = uf),
          (L.spread = Ql),
          (L.tail = Oc),
          (L.take = kc),
          (L.takeRight = Ac),
          (L.takeRightWhile = jc),
          (L.takeWhile = Mc),
          (L.tap = Xc),
          (L.throttle = $l),
          (L.thru = Zc),
          (L.toArray = Yu),
          (L.toPairs = Id),
          (L.toPairsIn = Ld),
          (L.toPath = tp),
          (L.toPlainObject = $u),
          (L.transform = Rd),
          (L.unary = eu),
          (L.union = Nc),
          (L.unionBy = Pc),
          (L.unionWith = Fc),
          (L.uniq = Ic),
          (L.uniqBy = Lc),
          (L.uniqWith = Rc),
          (L.unset = zd),
          (L.unzip = zc),
          (L.unzipWith = Bc),
          (L.update = Bd),
          (L.updateWith = Vd),
          (L.values = Hd),
          (L.valuesIn = Ud),
          (L.without = Vc),
          (L.words = Cf),
          (L.wrap = tu),
          (L.xor = Hc),
          (L.xorBy = Uc),
          (L.xorWith = Wc),
          (L.zip = Gc),
          (L.zipObject = Kc),
          (L.zipObjectDeep = qc),
          (L.zipWith = Jc),
          (L.entries = Id),
          (L.entriesIn = Ld),
          (L.extend = nd),
          (L.extendWith = rd),
          Rf(L, L),
          (L.add = rp),
          (L.attempt = wf),
          (L.camelCase = qd),
          (L.capitalize = Jd),
          (L.ceil = ip),
          (L.clamp = Wd),
          (L.clone = ru),
          (L.cloneDeep = au),
          (L.cloneDeepWith = ou),
          (L.cloneWith = iu),
          (L.conformsTo = su),
          (L.deburr = Yd),
          (L.defaultTo = kf),
          (L.divide = ap),
          (L.endsWith = Xd),
          (L.eq = cu),
          (L.escape = Zd),
          (L.escapeRegExp = Qd),
          (L.every = sl),
          (L.find = ll),
          (L.findIndex = Xs),
          (L.findKey = ld),
          (L.findLast = ul),
          (L.findLastIndex = Zs),
          (L.findLastKey = ud),
          (L.floor = op),
          (L.forEach = ml),
          (L.forEachRight = hl),
          (L.forIn = dd),
          (L.forInRight = fd),
          (L.forOwn = pd),
          (L.forOwnRight = md),
          (L.get = _d),
          (L.gt = lu),
          (L.gte = uu),
          (L.has = vd),
          (L.hasIn = yd),
          (L.head = nc),
          (L.identity = Mf),
          (L.includes = _l),
          (L.indexOf = rc),
          (L.inRange = Gd),
          (L.invoke = Sd),
          (L.isArguments = du),
          (L.isArray = Z),
          (L.isArrayBuffer = fu),
          (L.isArrayLike = pu),
          (L.isArrayLikeObject = mu),
          (L.isBoolean = hu),
          (L.isBuffer = gu),
          (L.isDate = _u),
          (L.isElement = vu),
          (L.isEmpty = yu),
          (L.isEqual = bu),
          (L.isEqualWith = xu),
          (L.isError = Su),
          (L.isFinite = Cu),
          (L.isFunction = wu),
          (L.isInteger = Tu),
          (L.isLength = Eu),
          (L.isMap = ku),
          (L.isMatch = Au),
          (L.isMatchWith = ju),
          (L.isNaN = Mu),
          (L.isNative = Nu),
          (L.isNil = Fu),
          (L.isNull = Pu),
          (L.isNumber = Iu),
          (L.isObject = Du),
          (L.isObjectLike = Ou),
          (L.isPlainObject = Lu),
          (L.isRegExp = Ru),
          (L.isSafeInteger = zu),
          (L.isSet = Bu),
          (L.isString = Vu),
          (L.isSymbol = Hu),
          (L.isTypedArray = Uu),
          (L.isUndefined = Wu),
          (L.isWeakMap = Gu),
          (L.isWeakSet = Ku),
          (L.join = cc),
          (L.kebabCase = $d),
          (L.last = lc),
          (L.lastIndexOf = uc),
          (L.lowerCase = ef),
          (L.lowerFirst = tf),
          (L.lt = qu),
          (L.lte = Ju),
          (L.max = sp),
          (L.maxBy = cp),
          (L.mean = lp),
          (L.meanBy = up),
          (L.min = dp),
          (L.minBy = fp),
          (L.stubArray = Yf),
          (L.stubFalse = Xf),
          (L.stubObject = Zf),
          (L.stubString = Qf),
          (L.stubTrue = $f),
          (L.multiply = pp),
          (L.nth = dc),
          (L.noConflict = zf),
          (L.noop = Bf),
          (L.now = Ml),
          (L.pad = nf),
          (L.padEnd = rf),
          (L.padStart = af),
          (L.parseInt = of),
          (L.random = Kd),
          (L.reduce = Cl),
          (L.reduceRight = wl),
          (L.repeat = sf),
          (L.replace = cf),
          (L.result = Nd),
          (L.round = mp),
          (L.runInContext = e),
          (L.sample = El),
          (L.size = kl),
          (L.snakeCase = lf),
          (L.some = Al),
          (L.sortedIndex = bc),
          (L.sortedIndexBy = xc),
          (L.sortedIndexOf = Sc),
          (L.sortedLastIndex = Cc),
          (L.sortedLastIndexBy = wc),
          (L.sortedLastIndexOf = Tc),
          (L.startCase = df),
          (L.startsWith = ff),
          (L.subtract = hp),
          (L.sum = gp),
          (L.sumBy = _p),
          (L.template = pf),
          (L.times = ep),
          (L.toFinite = Xu),
          (L.toInteger = Q),
          (L.toLength = Zu),
          (L.toLower = mf),
          (L.toNumber = Qu),
          (L.toSafeInteger = ed),
          (L.toString = $),
          (L.toUpper = hf),
          (L.trim = gf),
          (L.trimEnd = _f),
          (L.trimStart = vf),
          (L.truncate = yf),
          (L.unescape = bf),
          (L.uniqueId = np),
          (L.upperCase = xf),
          (L.upperFirst = Sf),
          (L.each = ml),
          (L.eachRight = hl),
          (L.first = nc),
          Rf(
            L,
            (function () {
              var e = {};
              return (
                Bi(L, function (t, n) {
                  A.call(L.prototype, n) || (e[n] = t);
                }),
                e
              );
            })(),
            { chain: !1 }
          ),
          (L.VERSION = r),
          Rn(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function (e) {
            L[e].placeholder = L;
          }),
          Rn(['drop', 'take'], function (e, t) {
            ((R.prototype[e] = function (r) {
              r = r === n ? 1 : pn(Q(r), 0);
              var i = this.__filtered__ && !t ? new R(this) : this.clone();
              return (
                i.__filtered__
                  ? (i.__takeCount__ = gn(r, i.__takeCount__))
                  : i.__views__.push({
                      size: gn(r, me),
                      type: e + (i.__dir__ < 0 ? 'Right' : '')
                    }),
                i
              );
            }),
              (R.prototype[e + 'Right'] = function (t) {
                return this.reverse()[e](t).reverse();
              }));
          }),
          Rn(['filter', 'map', 'takeWhile'], function (e, t) {
            var n = t + 1,
              r = n == se || n == le;
            R.prototype[e] = function (e) {
              var t = this.clone();
              return (
                t.__iteratees__.push({
                  iteratee: J(e, 3),
                  type: n
                }),
                (t.__filtered__ = t.__filtered__ || r),
                t
              );
            };
          }),
          Rn(['head', 'last'], function (e, t) {
            var n = 'take' + (t ? 'Right' : '');
            R.prototype[e] = function () {
              return this[n](1).value()[0];
            };
          }),
          Rn(['initial', 'tail'], function (e, t) {
            var n = 'drop' + (t ? '' : 'Right');
            R.prototype[e] = function () {
              return this.__filtered__ ? new R(this) : this[n](1);
            };
          }),
          (R.prototype.compact = function () {
            return this.filter(Mf);
          }),
          (R.prototype.find = function (e) {
            return this.filter(e).head();
          }),
          (R.prototype.findLast = function (e) {
            return this.reverse().find(e);
          }),
          (R.prototype.invokeMap = K(function (e, t) {
            return typeof e == 'function'
              ? new R(this)
              : this.map(function (n) {
                  return Qi(n, e, t);
                });
          })),
          (R.prototype.reject = function (e) {
            return this.filter(Gl(J(e)));
          }),
          (R.prototype.slice = function (e, t) {
            e = Q(e);
            var r = this;
            return r.__filtered__ && (e > 0 || t < 0)
              ? new R(r)
              : (e < 0 ? (r = r.takeRight(-e)) : e && (r = r.drop(e)),
                t !== n && ((t = Q(t)), (r = t < 0 ? r.dropRight(-t) : r.take(t - e))),
                r);
          }),
          (R.prototype.takeRightWhile = function (e) {
            return this.reverse().takeWhile(e).reverse();
          }),
          (R.prototype.toArray = function () {
            return this.take(me);
          }),
          Bi(R.prototype, function (e, t) {
            var r = /^(?:filter|find|map|reject)|While$/.test(t),
              i = /^(?:head|last)$/.test(t),
              a = L[i ? 'take' + (t == 'last' ? 'Right' : '') : t],
              o = i || /^find/.test(t);
            a &&
              (L.prototype[t] = function () {
                var t = this.__wrapped__,
                  s = i ? [1] : arguments,
                  c = t instanceof R,
                  l = s[0],
                  u = c || Z(t),
                  d = function (e) {
                    var t = a.apply(L, Wn([e], s));
                    return i && f ? t[0] : t;
                  };
                u && r && typeof l == 'function' && l.length != 1 && (c = u = !1);
                var f = this.__chain__,
                  p = !!this.__actions__.length,
                  m = o && !f,
                  h = c && !p;
                if (!o && u) {
                  t = h ? t : new R(this);
                  var g = e.apply(t, s);
                  return (
                    g.__actions__.push({
                      func: Zc,
                      args: [d],
                      thisArg: n
                    }),
                    new Ur(g, f)
                  );
                }
                return m && h ? e.apply(this, s) : ((g = this.thru(d)), m ? (i ? g.value()[0] : g.value()) : g);
              });
          }),
          Rn(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function (e) {
            var t = jt[e],
              n = /^(?:push|sort|unshift)$/.test(e) ? 'tap' : 'thru',
              r = /^(?:pop|shift)$/.test(e);
            L.prototype[e] = function () {
              var e = arguments;
              if (r && !this.__chain__) {
                var i = this.value();
                return t.apply(Z(i) ? i : [], e);
              }
              return this[n](function (n) {
                return t.apply(Z(n) ? n : [], e);
              });
            };
          }),
          Bi(R.prototype, function (e, t) {
            var n = L[t];
            if (n) {
              var r = n.name + '';
              (A.call(nr, r) || (nr[r] = []),
                nr[r].push({
                  name: t,
                  func: n
                }));
            }
          }),
          (nr[Eo(n, v).name] = [
            {
              name: 'wrapper',
              func: n
            }
          ]),
          (R.prototype.clone = z),
          (R.prototype.reverse = Wr),
          (R.prototype.value = Gr),
          (L.prototype.at = Qc),
          (L.prototype.chain = $c),
          (L.prototype.commit = el),
          (L.prototype.next = tl),
          (L.prototype.plant = rl),
          (L.prototype.reverse = il),
          (L.prototype.toJSON = L.prototype.valueOf = L.prototype.value = al),
          (L.prototype.first = L.prototype.head),
          Zt && (L.prototype[Zt] = nl),
          L
        );
      })();
      typeof define == 'function' && typeof define.amd == 'object' && define.amd
        ? ((wn._ = Fr),
          define(function () {
            return Fr;
          }))
        : En
          ? (((En.exports = Fr)._ = Fr), (Tn._ = Fr))
          : (wn._ = Fr);
    }).call(e);
  })(),
  a = {
    getRandomId: () => window.crypto.getRandomValues(new Uint32Array(1))[0],
    isPromise: (e) => e && a.isFunction(e.then),
    isFunction: (e) => e && {}.toString.call(e) === '[object Function]',
    isAsyncFunction: (e) => e && {}.toString.call(e) === '[object AsyncFunction]',
    isString: (e) => typeof e == 'string' || e instanceof String,
    isObject: (e) => !!(e && typeof e == 'object' && !Array.isArray(e)),
    hasHash: (e) => !!(e && e.search(/^[#\/].*$/) === 0),
    getUrlWithoutHash: (e) => {
      if (!e) return '';
      let t = e.split('#')[0];
      return t.startsWith('http') ? t : window.location.origin + (t.startsWith('/') ? '' : '/') + t;
    },
    isSameUrl: (e, t) => (!e || !t ? !1 : a.getUrlWithoutHash(e) === a.getUrlWithoutHash(t)),
    getPathWithoutHash: (e) => {
      for (; a.hasHash(e); ) e = e.substring(1, e.length);
      return e;
    },
    getTrimmedUrl: (e) => {
      let t = e.length > 0 ? a.getPathWithoutHash(e) : e;
      return a.trimTrailingSlash(t.split('?')[0]);
    },
    addLeadingSlash: (e) => (e.startsWith('/') ? '' : '/') + e,
    trimLeadingSlash: (e) => (a.isString(e) ? e.replace(/^\/+/g, '') : ''),
    addTrailingSlash: (e) => (a.isString(e) ? e.replace(/\/?$/, '/') : ''),
    trimTrailingSlash: (e) => (a.isString(e) ? e.replace(/\/+$/, '') : ''),
    normalizePath: (e) => (typeof e == 'string' ? a.addLeadingSlash(a.addTrailingSlash(e)) : e),
    isElementVisible: (e) => (e ? window.getComputedStyle(e).getPropertyValue('display') !== 'none' : !1),
    getNodeList: (e, t = !1) => {
      let n = [];
      return (
        e &&
          Array.from(document.querySelectorAll(e)).forEach((e) => {
            t ? a.isElementVisible(e) && n.push(e) : n.push(e);
          }),
        n
      );
    },
    prependOrigin: (e) => {
      if (!e || e.startsWith('http')) return e;
      let t = e.startsWith('/');
      return e.length ? window.location.origin + (t ? '' : '/') + e : window.location.origin;
    },
    getConfigValueFromObject: (e, t) => {
      let n = 0,
        r = e,
        i = t.split('.');
      for (; r && n < i.length; ) r = r[i[n++]];
      return r;
    },
    getConfigBooleanValue: (e, t) => {
      let n = a.getConfigValueFromObject(e, t);
      return n === !0 || n === 'true';
    },
    getUrlParameter: (e) => new URLSearchParams(window.location.search).get(e),
    removeProperties(e, t) {
      let n = {};
      if (!(t instanceof Array) || !t.length)
        return (
          console.error('[ERROR] removeProperties requires second parameter: array of keys to remove from object.'),
          e
        );
      for (let r in e)
        if (e.hasOwnProperty(r)) {
          let i = t.filter((e) => r.includes(e)).length === 0,
            a =
              t
                .filter((e) => e.endsWith('*'))
                .map((e) => e.slice(0, -1))
                .filter((e) => r.startsWith(e)).length === 0;
          i && a && (n[r] = e[r]);
        }
      return n;
    },
    replaceVars(e, t, n, r = !0, a = !1) {
      let o = e;
      if (t)
        if (r)
          o = (0, i.replace)(o, /{([\s\S]+?)}/g, (e) => {
            let r = e.slice(1, -1).trim();
            return (r.indexOf(n) === 0 && (r = r.substring(n.length)), (0, i.get)(t, r, e));
          });
        else {
          let e = a ? ' ' : '';
          ((o = o.replace(/\//g, e + '/') + e),
            Array.from(Object.entries(t))
              .sort((e, t) => t[0].length - e[0].length)
              .forEach((t) => {
                o = o.replace(new RegExp(this.escapeRegExp(n + t[0] + e), 'g'), encodeURIComponent(t[1]));
              }),
            (o = o.replace(new RegExp(this.escapeRegExp(e), 'g'), '')));
        }
      return (r && (o = o.replace(RegExp('\\{' + this.escapeRegExp(n) + '[^\\}]+\\}', 'g'), '')), o);
    },
    escapeRegExp(e) {
      return e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    hasHashOrSlash: (e) => !!(e && e.search(/^[#\/].*$/) === 0),
    getPathWithoutHashOrSlash: (e) => {
      for (; a.hasHashOrSlash(e); ) e = e.substring(1, e.length);
      return e;
    }
  },
  o = {
    wrapAsPromise: (e) =>
      new Promise((t) => {
        t(e);
      }),
    applyFunctionPromisified: (e, t) => ((e = e.apply(void 0, t)), a.isPromise(e) ? e : o.wrapAsPromise(e)),
    getConfigValueFromObjectAsync: (e, t, ...n) => {
      let r = a.getConfigValueFromObject(e, t);
      return a.isFunction(r) ? o.applyFunctionPromisified(r, n) : o.wrapAsPromise(r);
    }
  },
  s = new (class {
    setErrorMessage(e) {
      this.getLuigi().getEngine()?._connector?.showFatalError(e);
    }
    getLuigi() {
      return window.Luigi;
    }
    getConfigValue(e) {
      return this.getLuigi().getConfigValue(e);
    }
    getConfigValueAsync(e) {
      return this.getLuigi().getConfigValueAsync(e);
    }
    async executeConfigFnAsync(e, t = !1, ...n) {
      let r = this.getConfigValue(e);
      if (a.isFunction(r))
        try {
          return await o.applyFunctionPromisified(r, n);
        } catch (e) {
          if (t) return Promise.reject(e);
        }
      return Promise.resolve(void 0);
    }
  })(),
  c = new (class {
    _authKey;
    _storageType;
    _defaultStorage;
    _newlyAuthorizedKey;
    _invalidStorageMsg;
    _internalStorage = {};
    constructor() {
      ((this._defaultStorage = 'localStorage'),
        (this._authKey = 'luigi.auth'),
        (this._newlyAuthorizedKey = 'luigi.newlyAuthorized'),
        (this._invalidStorageMsg =
          'Configuration Error: Invalid auth.storage value defined. Must be one of localStorage, sessionStorage or none.'));
    }
    reset() {
      this._storageType = void 0;
    }
    getStorageKey() {
      return this._authKey;
    }
    getStorageType() {
      return ((this._storageType ||= s.getConfigValue('auth.storage') || this._defaultStorage), this._storageType);
    }
    getAuthData() {
      return this._getStore(this.getStorageKey());
    }
    setAuthData(e) {
      this._setStore(this.getStorageKey(), e);
    }
    removeAuthData() {
      this._setStore(this.getStorageKey(), void 0);
    }
    isNewlyAuthorized() {
      return !!this._getStore(this._newlyAuthorizedKey);
    }
    setNewlyAuthorized() {
      this._setStore(this._newlyAuthorizedKey, !0);
    }
    removeNewlyAuthorized() {
      this._setStore(this._newlyAuthorizedKey, void 0);
    }
    _getWebStorage(e) {
      return window[e];
    }
    _setStore(e, t) {
      switch (this.getStorageType()) {
        case 'localStorage':
        case 'sessionStorage':
          t === void 0
            ? this._getWebStorage(this.getStorageType()).removeItem(e)
            : this._getWebStorage(this.getStorageType()).setItem(e, JSON.stringify(t));
          break;
        case 'none':
          this._internalStorage[e] = t;
          break;
        default:
          console.error(this._invalidStorageMsg);
      }
    }
    _getStore(e) {
      try {
        switch (this.getStorageType()) {
          case 'localStorage':
          case 'sessionStorage':
            return JSON.parse(this._getWebStorage(this.getStorageType()).getItem(e));
          case 'none':
            return this._internalStorage[e];
          default:
            console.error(this._invalidStorageMsg);
        }
      } catch {
        console.warn('Error parsing authorization data. Auto-logout might not work!');
      }
    }
  })(),
  l = new (class {
    isAuthorizationEnabled() {
      return !!s.getConfigValue('auth.use');
    }
    login() {
      this.isAuthorizationEnabled() && ki.startAuthorization();
    }
    logout() {
      this.isAuthorizationEnabled() && ki.logout();
    }
    async handleAuthEvent(e, t, n, r) {
      let i = await s.executeConfigFnAsync('auth.events.' + e, !1, t, n),
        a = i === void 0 || !!i;
      if (a && r) {
        window.location.href = r;
        return;
      }
      return a;
    }
    get store() {
      return (
        s.getLuigi()?.initialized ||
          console.warn(
            'Luigi Core is not initialized yet. Consider moving your code to the luigiAfterInit lifecycle hook. Documentation: https://docs.luigi-project.io/docs/lifecycle-hooks'
          ),
        {
          getStorageKey: () => c.getStorageKey(),
          getStorageType: () => c.getStorageType(),
          getAuthData: () => c.getAuthData(),
          setAuthData: (e) => {
            (c.setAuthData(e), ki.broadcastAuthData(e));
          },
          removeAuthData: () => c.removeAuthData(),
          setNewlyAuthorized: () => {
            (c.setNewlyAuthorized(), ki.resetExpirationChecks());
          }
        }
      );
    }
  })(),
  u = new (class {
    getStoredAuthData() {
      return c.getAuthData();
    }
    isLoggedIn() {
      let e = this.getStoredAuthData();
      return !!(e && e.accessTokenExpirationDate > Number(/* @__PURE__ */ new Date()));
    }
    parseUrlAuthErrors() {
      let e = a.getUrlParameter('error'),
        t = a.getUrlParameter('errorDescription');
      if (e)
        return {
          error: e,
          errorDescription: t
        };
    }
    async handleUrlAuthErrors(e, t, n) {
      return t
        ? await l.handleAuthEvent(
            'onAuthError',
            e,
            {
              error: t,
              errorDescription: n
            },
            e.logoutUrl +
              '?post_logout_redirect_uri=' +
              e.post_logout_redirect_uri +
              '&error=' +
              encodeURIComponent(t) +
              '&errorDescription=' +
              encodeURIComponent(n || '')
          )
        : !0;
    }
  })();
//#endregion
//#region node_modules/@luigi-project/container/bundle.js
typeof window < 'u' && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add('5');
var d = !1;
d = !0;
var f = {},
  p = Symbol(),
  m = Symbol('filename'),
  h = globalThis.process?.env?.NODE_ENV,
  g = h && !h.toLowerCase().startsWith('prod'),
  _ = Array.isArray,
  v = Array.prototype.indexOf,
  y = Array.prototype.includes,
  b = Array.from,
  x = Object.keys,
  S = Object.defineProperty,
  C = Object.getOwnPropertyDescriptor,
  ee = Object.getOwnPropertyDescriptors,
  te = Object.prototype,
  ne = Array.prototype,
  re = Object.getPrototypeOf,
  ie = Object.isExtensible,
  ae = () => {};
function oe(e) {
  return e();
}
function se(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function ce() {
  var e, t;
  return {
    promise: new Promise((n, r) => {
      ((e = n), (t = r));
    }),
    resolve: e,
    reject: t
  };
}
var le = 16,
  ue = 32,
  de = 64,
  fe = 512,
  pe = 1024,
  me = 2048,
  he = 4096,
  ge = 8192,
  _e = 16384,
  ve = 32768,
  ye = 1 << 25,
  be = 65536,
  xe = 1 << 17,
  Se = 1 << 19,
  Ce = 65536,
  we = 1 << 21,
  Te = 1 << 22,
  Ee = 1 << 23,
  De = Symbol('$state'),
  Oe = Symbol('legacy props'),
  ke = Symbol('proxy path'),
  Ae = Symbol('attributes'),
  je = Symbol('class'),
  Me = Symbol('style'),
  Ne = Symbol('text'),
  Pe = Symbol('hmr anchor'),
  Fe = new (class extends Error {
    name = 'StaleReactionError';
    message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })();
function Ie(e) {
  if (g) {
    let t = /* @__PURE__ */ Error(
      `lifecycle_outside_component\n\`${e}(...)\` can only be used during component initialisation\nhttps://svelte.dev/e/lifecycle_outside_component`
    );
    throw ((t.name = 'Svelte error'), t);
  }
  throw Error('https://svelte.dev/e/lifecycle_outside_component');
}
var Le = 'font-weight: bold',
  Re = 'font-weight: normal';
function ze(e) {
  g
    ? console.warn(
        `%c[svelte] hydration_mismatch\n%c${e ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${e}` : 'Hydration failed because the initial UI does not match what was rendered on the server'}\nhttps://svelte.dev/e/hydration_mismatch`,
        Le,
        Re
      )
    : console.warn('https://svelte.dev/e/hydration_mismatch');
}
function Be(e) {
  g
    ? console.warn(
        `%c[svelte] state_proxy_equality_mismatch\n%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${e}\` will produce unexpected results\nhttps://svelte.dev/e/state_proxy_equality_mismatch`,
        Le,
        Re
      )
    : console.warn('https://svelte.dev/e/state_proxy_equality_mismatch');
}
var w,
  Ve = !1;
function He(e) {
  Ve = e;
}
function Ue(e) {
  if (e === null) throw (ze(), f);
  return (w = e);
}
function We() {
  return Ue(bn(w));
}
function Ge(e = !0) {
  for (var t = 0, n = w; ; ) {
    if (n.nodeType === 8) {
      var r = n.data;
      if (r === ']') {
        if (t === 0) return n;
        --t;
      } else (r === '[' || r === '[!' || (r[0] === '[' && !isNaN(Number(r.slice(1))))) && (t += 1);
    }
    var i = bn(n);
    (e && n.remove(), (n = i));
  }
}
function Ke(e) {
  return e === this.v;
}
function qe(e) {
  return ((t = e), (n = this.v), !(t == t ? t !== n || (typeof t == 'object' && t) || typeof t == 'function' : n == n));
  var t, n;
}
function Je(e, t) {
  return ((e.label = t), Ye(e.v, t), e);
}
function Ye(e, t) {
  return (e?.[ke]?.(t), e);
}
function Xe(e) {
  let t = /* @__PURE__ */ Error(),
    n = (function () {
      let e = Error.stackTraceLimit;
      Error.stackTraceLimit = Infinity;
      let t = /* @__PURE__ */ Error().stack;
      if (((Error.stackTraceLimit = e), !t)) return [];
      let n = t.split('\n'),
        r = [];
      for (let e = 0; e < n.length; e++) {
        let t = n[e],
          i = t.replaceAll('\\', '/');
        if (t.trim() !== 'Error') {
          if (t.includes('validate_each_keys')) return [];
          i.includes('svelte/src/internal') || i.includes('node_modules/.vite') || r.push(t);
        }
      }
      return r;
    })();
  return n.length === 0
    ? null
    : (n.unshift('\n'), S(t, 'stack', { value: n.join('\n') }), S(t, 'name', { value: e }), t);
}
var T = null;
function Ze(e) {
  T = e;
}
var Qe = null;
function $e(e) {
  Qe = e;
}
var et = null;
function tt(e) {
  et = e;
}
function nt(e, t = !1, n) {
  ((T = {
    p: T,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: F,
    l:
      d && !t
        ? {
            s: null,
            u: null,
            $: []
          }
        : null
  }),
    g && ((T.function = n), (et = n)));
}
function rt(e) {
  var t = T,
    n = t.e;
  if (n !== null) for (var r of ((t.e = null), n)) kn(r);
  return (e !== void 0 && (t.x = e), (t.i = !0), (T = t.p), g && (et = T?.function ?? null), e ?? {});
}
function it() {
  return !d || (T !== null && T.l === null);
}
var at = [];
function ot() {
  var e = at;
  ((at = []), se(e));
}
function st(e) {
  if (at.length === 0 && !St) {
    var t = at;
    queueMicrotask(() => {
      t === at && ot();
    });
  }
  at.push(e);
}
function ct() {
  for (; at.length > 0; ) ot();
}
var lt = /* @__PURE__ */ new WeakMap();
function ut(e) {
  var t = F;
  if (t === null) return ((P.f |= Ee), e);
  if (
    (g &&
      e instanceof Error &&
      !lt.has(e) &&
      lt.set(
        e,
        (function (e, t) {
          let n = C(e, 'message');
          if (!(n && !n.configurable)) {
            for (var r = j ? '  ' : '	', i = `\n${r}in ${t.fn?.name || '<unknown>'}`, a = t.ctx; a !== null; )
              ((i += `\n${r}in ${a.function?.[m].split('/').pop()}`), (a = a.p));
            return {
              message: e.message + `\n${i}\n`,
              stack: e.stack
                ?.split('\n')
                .filter((e) => !e.includes('svelte/src/internal'))
                .join('\n')
            };
          }
        })(e, t)
      ),
    (t.f & ve) === 0 && !(4 & t.f))
  )
    throw (g && !t.parent && e instanceof Error && dt(e), e);
  E(e, t);
}
function E(e, t) {
  for (; t !== null; ) {
    if (128 & t.f) {
      if ((t.f & ve) === 0) throw e;
      try {
        t.b.error(e);
        return;
      } catch (t) {
        e = t;
      }
    }
    t = t.parent;
  }
  throw (g && e instanceof Error && dt(e), e);
}
function dt(e) {
  let t = lt.get(e);
  t && (S(e, 'message', { value: t.message }), S(e, 'stack', { value: t.stack }));
}
var ft = -7169;
function pt(e, t) {
  e.f = (e.f & ft) | t;
}
function mt(e) {
  (e.f & fe) !== 0 || e.deps === null ? pt(e, pe) : pt(e, he);
}
function ht(e) {
  if (e !== null) for (let t of e) 2 & t.f && (t.f & Ce) !== 0 && ((t.f ^= Ce), ht(t.deps));
}
function gt(e, t, n) {
  ((e.f & me) === 0 ? (e.f & he) !== 0 && n.add(e) : t.add(e), ht(e.deps), pt(e, pe));
}
var _t = !1,
  vt = null,
  D = null,
  yt = null,
  bt = null,
  xt = null,
  St = !1,
  Ct = !1,
  wt = null,
  Tt = null,
  Et = 0,
  Dt = /* @__PURE__ */ new Set(),
  Ot = 1,
  O = class e {
    id = Ot++;
    #e = !1;
    linked = !0;
    #t = null;
    #n = null;
    async_deriveds = /* @__PURE__ */ new Map();
    current = /* @__PURE__ */ new Map();
    previous = /* @__PURE__ */ new Map();
    unblocked = /* @__PURE__ */ new Set();
    #r = /* @__PURE__ */ new Set();
    #i = /* @__PURE__ */ new Set();
    #a = /* @__PURE__ */ new Set();
    #o = 0;
    #s = /* @__PURE__ */ new Map();
    #c = null;
    #l = [];
    #u = [];
    #d = /* @__PURE__ */ new Set();
    #f = /* @__PURE__ */ new Set();
    #p = /* @__PURE__ */ new Map();
    #m = /* @__PURE__ */ new Set();
    is_fork = !1;
    #h = !1;
    #g() {
      if (this.is_fork) return !0;
      for (let n of this.#s.keys()) {
        for (var e = n, t = !1; e.parent !== null; ) {
          if (this.#p.has(e)) {
            t = !0;
            break;
          }
          e = e.parent;
        }
        if (!t) return !0;
      }
      return !1;
    }
    skip_effect(e) {
      (this.#p.has(e) ||
        this.#p.set(e, {
          d: [],
          m: []
        }),
        this.#m.delete(e));
    }
    unskip_effect(e, t = (e) => this.schedule(e)) {
      var n = this.#p.get(e);
      if (n) {
        for (var r of (this.#p.delete(e), n.d)) (pt(r, me), t(r));
        for (r of n.m) (pt(r, he), t(r));
      }
      this.#m.add(e);
    }
    #_() {
      if (
        ((this.#e = !0),
        Et++ > 1e3 &&
          (this.#C(),
          (function () {
            if (g) {
              var e = /* @__PURE__ */ new Map();
              for (let n of D.current.keys())
                for (let [r, i] of n.updated ?? []) {
                  var t = e.get(r);
                  (t ||
                    ((t = {
                      error: i.error,
                      count: 0
                    }),
                    e.set(r, t)),
                    (t.count += i.count));
                }
              for (let t of e.values()) t.error && console.error(t.error);
            }
            try {
              (function () {
                if (g) {
                  let e = /* @__PURE__ */ Error(
                    'effect_update_depth_exceeded\nMaximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state\nhttps://svelte.dev/e/effect_update_depth_exceeded'
                  );
                  throw ((e.name = 'Svelte error'), e);
                }
                throw Error('https://svelte.dev/e/effect_update_depth_exceeded');
              })();
            } catch (e) {
              (g && S(e, 'stack', { value: '' }), E(e, xt));
            }
          })()),
        g)
      )
        for (let e of this.current.keys()) Dt.add(e);
      if (!this.#g()) {
        for (let e of this.#d) (this.#f.delete(e), pt(e, me), this.schedule(e));
        for (let e of this.#f) (pt(e, he), this.schedule(e));
      }
      let t = this.#l;
      ((this.#l = []), this.apply());
      var n = (wt = []),
        r = [],
        i = (Tt = []);
      for (let e of t)
        try {
          this.#v(e, n, r);
        } catch (t) {
          throw (Ft(e), t);
        }
      if (((D = null), i.length > 0)) {
        var a = e.ensure();
        for (let e of i) a.schedule(e);
      }
      if (((wt = null), (Tt = null), this.#g())) {
        (this.#x(r), this.#x(n));
        for (let [e, t] of this.#p) Pt(e, t);
        i.length > 0 && D.#_();
        return;
      }
      let o = this.#y();
      if (o) o.#b(this);
      else {
        (this.#d.clear(), this.#f.clear());
        for (let e of this.#r) e(this);
        (this.#r.clear(), (yt = this), At(r), At(n), (yt = null), this.#c?.resolve());
        var s = D;
        if ((this.linked && this.#o === 0 && this.#C(), this.#l.length > 0)) {
          s === null && ((s = this), this.#S());
          let e = s;
          e.#l.push(...this.#l.filter((t) => !e.#l.includes(t)));
        }
        s !== null && s.#_();
      }
    }
    #v(e, t, n) {
      e.f ^= pe;
      for (var r = e.first; r !== null; ) {
        var i = r.f,
          a = !!(96 & i);
        if (!((a && (i & pe) !== 0) || (i & ge) !== 0 || this.#p.has(r)) && r.fn !== null) {
          a ? (r.f ^= pe) : 4 & i ? t.push(r) : rr(r) && ((i & le) !== 0 && this.#f.add(r), cr(r));
          var o = r.first;
          if (o !== null) {
            r = o;
            continue;
          }
        }
        for (; r !== null; ) {
          var s = r.next;
          if (s !== null) {
            r = s;
            break;
          }
          r = r.parent;
        }
      }
    }
    #y() {
      for (var e = this.#t; e !== null; ) {
        if (!e.is_fork) {
          for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
        }
        e = e.#t;
      }
      return null;
    }
    #b(e) {
      for (let [t, n] of e.current)
        (!this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n));
      for (let [t, n] of e.async_deriveds) {
        let e = this.async_deriveds.get(t);
        e && n.promise.then(e.resolve);
      }
      let t = (e) => {
        var n = e.reactions;
        if (n !== null)
          for (let e of n) {
            var r = e.f;
            if (2 & r) t(e);
            else {
              var i = e;
              4194320 & r && !this.async_deriveds.has(i) && (this.#f.delete(i), pt(i, me), this.schedule(i));
            }
          }
      };
      for (let e of this.current.keys()) t(e);
      (this.oncommit(() => e.discard()), e.#C(), (D = this), this.#_());
    }
    #x(e) {
      for (var t = 0; t < e.length; t += 1) gt(e[t], this.#d, this.#f);
    }
    capture(e, t, n = !1) {
      (e.v === p || this.previous.has(e) || this.previous.set(e, e.v),
        (e.f & Ee) === 0 && (this.current.set(e, [t, n]), bt?.set(e, t)),
        this.is_fork || (e.v = t));
    }
    activate() {
      D = this;
    }
    deactivate() {
      ((D = null), (bt = null));
    }
    flush() {
      try {
        (g && Dt.clear(), (Ct = !0), (D = this), this.#_());
      } finally {
        if (((Et = 0), (xt = null), (wt = null), (Tt = null), (Ct = !1), (D = null), (bt = null), Zt.clear(), g))
          for (let e of Dt) e.updated = null;
      }
    }
    discard() {
      for (let e of this.#i) e(this);
      (this.#i.clear(), this.#a.clear(), this.#C());
    }
    register_created_effect(e) {
      this.#u.push(e);
    }
    increment(e, t) {
      if (((this.#o += 1), e)) {
        let e = this.#s.get(t) ?? 0;
        this.#s.set(t, e + 1);
      }
    }
    decrement(e, t) {
      if ((--this.#o, e)) {
        let e = this.#s.get(t) ?? 0;
        e === 1 ? this.#s.delete(t) : this.#s.set(t, e - 1);
      }
      this.#h ||
        ((this.#h = !0),
        st(() => {
          ((this.#h = !1), this.linked && this.flush());
        }));
    }
    transfer_effects(e, t) {
      for (let t of e) this.#d.add(t);
      for (let e of t) this.#f.add(e);
      (e.clear(), t.clear());
    }
    oncommit(e) {
      this.#r.add(e);
    }
    ondiscard(e) {
      this.#i.add(e);
    }
    on_fork_commit(e) {
      this.#a.add(e);
    }
    run_fork_commit_callbacks() {
      for (let e of this.#a) e(this);
      this.#a.clear();
    }
    settled() {
      return (this.#c ??= ce()).promise;
    }
    static ensure() {
      if (D === null) {
        let t = (D = new e());
        (t.#S(),
          Ct ||
            St ||
            st(() => {
              t.#e || t.flush();
            }));
      }
      return D;
    }
    apply() {
      bt = null;
    }
    schedule(e) {
      if (((xt = e), e.b?.is_pending && 16777228 & e.f && (e.f & ve) === 0)) e.b.defer_effect(e);
      else {
        for (var t = e; t.parent !== null; ) {
          var n = (t = t.parent).f;
          if (!(wt === null || t !== F || (P !== null && 2 & P.f))) return;
          if (96 & n) {
            if ((n & pe) === 0) return;
            t.f ^= pe;
          }
        }
        this.#l.push(t);
      }
    }
    #S() {
      (vt === null ? (vt = this) : ((vt.#n = this), (this.#t = vt)), (vt = this));
    }
    #C() {
      var e = this.#t,
        t = this.#n;
      (e === null || (e.#n = t), t === null ? (vt = e) : (t.#t = e), (this.linked = !1));
    }
  };
function k(e) {
  var t = St;
  St = !0;
  try {
    var n;
    for (e && (D === null || D.is_fork || D.flush(), (n = e())); ; ) {
      if ((ct(), D === null)) return n;
      D.flush();
    }
  } finally {
    St = t;
  }
}
var kt = null;
function At(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        !(24576 & r.f) &&
        rr(r) &&
        ((kt = /* @__PURE__ */ new Set()),
        cr(r),
        r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ln(r),
        kt?.size > 0)
      ) {
        Zt.clear();
        for (let e of kt) {
          if (24576 & e.f) continue;
          let t = [e],
            n = e.parent;
          for (; n !== null; ) (kt.has(n) && (kt.delete(n), t.push(n)), (n = n.parent));
          for (let e = t.length - 1; e >= 0; e--) {
            let n = t[e];
            24576 & n.f || cr(n);
          }
        }
        kt.clear();
      }
    }
    kt = null;
  }
}
function jt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (let i of e.reactions) {
      let e = i.f;
      2 & e ? jt(i, t, n, r) : 4194320 & e && (e & me) === 0 && Mt(i, t, r) && (pt(i, me), Nt(i));
    }
}
function Mt(e, t, n) {
  let r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (let r of e.deps) {
      if (y.call(t, r)) return !0;
      if (2 & r.f && Mt(r, t, n)) return (n.set(r, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function Nt(e) {
  D.schedule(e);
}
function Pt(e, t) {
  if ((e.f & ue) === 0 || (e.f & pe) === 0) {
    ((e.f & me) === 0 ? (e.f & he) !== 0 && t.m.push(e) : t.d.push(e), pt(e, pe));
    for (var n = e.first; n !== null; ) (Pt(n, t), (n = n.next));
  }
}
function Ft(e) {
  pt(e, pe);
  for (var t = e.first; t !== null; ) (Ft(t), (t = t.next));
}
var A = class {
  parent;
  is_pending = !1;
  transform_error;
  #e;
  #t = Ve ? w : null;
  #n;
  #r;
  #i;
  #a = null;
  #o = null;
  #s = null;
  #c = null;
  #l = 0;
  #u = 0;
  #d = !1;
  #f = /* @__PURE__ */ new Set();
  #p = /* @__PURE__ */ new Set();
  #m = null;
  #h = (function (e) {
    let t,
      n = 0,
      r = en(0);
    return (
      g && Je(r, 'createSubscriber version'),
      () => {
        En() &&
          (I(r),
          jn(
            () => (
              n === 0 && (t = dr(() => e(() => cn(r)))),
              (n += 1),
              () => {
                st(() => {
                  (--n, n === 0 && (t?.(), (t = void 0), cn(r)));
                });
              }
            )
          ));
      }
    );
  })(
    () => (
      (this.#m = en(this.#l)),
      g && Je(this.#m, '$effect.pending()'),
      () => {
        this.#m = null;
      }
    )
  );
  constructor(e, t, n, r) {
    ((this.#e = e),
      (this.#n = t),
      (this.#r = (e) => {
        var t = F;
        ((t.b = this), (t.f |= 128), n(e));
      }),
      (this.parent = F.b),
      (this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e)),
      (this.#i = Mn(() => {
        if (Ve) {
          let e = this.#t;
          We();
          let t = e.data === '[!';
          if (e.data.startsWith('[?')) {
            let t = JSON.parse(e.data.slice(2));
            this.#_(t);
          } else t ? this.#v() : this.#g();
        } else this.#y();
      }, 589824)),
      Ve && (this.#e = w));
  }
  #g() {
    try {
      this.#a = Nn(() => this.#r(this.#e));
    } catch (e) {
      this.error(e);
    }
  }
  #_(e) {
    let t = this.#n.failed;
    t &&
      (this.#s = Nn(() => {
        t(
          this.#e,
          () => e,
          () => () => {}
        );
      }));
  }
  #v() {
    let e = this.#n.pending;
    e &&
      ((this.is_pending = !0),
      (this.#o = Nn(() => e(this.#e))),
      st(() => {
        var e = (this.#c = document.createDocumentFragment()),
          t = vn();
        (e.append(t),
          (this.#a = this.#x(() => Nn(() => this.#r(t)))),
          this.#u === 0 &&
            (this.#e.before(e),
            (this.#c = null),
            Rn(this.#o, () => {
              this.#o = null;
            }),
            this.#b(D)));
      }));
  }
  #y() {
    try {
      if (
        ((this.is_pending = this.has_pending_snippet()),
        (this.#u = 0),
        (this.#l = 0),
        (this.#a = Nn(() => {
          this.#r(this.#e);
        })),
        this.#u > 0)
      ) {
        var e = (this.#c = document.createDocumentFragment());
        Hn(this.#a, e);
        let t = this.#n.pending;
        this.#o = Nn(() => t(this.#e));
      } else this.#b(D);
    } catch (e) {
      this.error(e);
    }
  }
  #b(e) {
    ((this.is_pending = !1), e.transfer_effects(this.#f, this.#p));
  }
  defer_effect(e) {
    gt(e, this.#f, this.#p);
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  #x(e) {
    var t = F,
      n = P,
      r = T;
    (qn(this.#i), Kn(this.#i), Ze(this.#i.ctx));
    try {
      return (O.ensure(), e());
    } catch (e) {
      return (ut(e), null);
    } finally {
      (qn(t), Kn(n), Ze(r));
    }
  }
  #S(e, t) {
    this.has_pending_snippet()
      ? ((this.#u += e),
        this.#u === 0 &&
          (this.#b(t),
          this.#o &&
            Rn(this.#o, () => {
              this.#o = null;
            }),
          (this.#c &&= (this.#e.before(this.#c), null))))
      : this.parent && this.parent.#S(e, t);
  }
  update_pending_count(e, t) {
    (this.#S(e, t),
      (this.#l += e),
      this.#m &&
        !this.#d &&
        ((this.#d = !0),
        st(() => {
          ((this.#d = !1), this.#m && on(this.#m, this.#l));
        })));
  }
  get_effect_pending() {
    return (this.#h(), I(this.#m));
  }
  error(e) {
    if (!this.#n.onerror && !this.#n.failed) throw e;
    D?.is_fork
      ? (this.#a && D.skip_effect(this.#a),
        this.#o && D.skip_effect(this.#o),
        this.#s && D.skip_effect(this.#s),
        D.on_fork_commit(() => {
          this.#C(e);
        }))
      : this.#C(e);
  }
  #C(e) {
    ((this.#a &&= (In(this.#a), null)),
      (this.#o &&= (In(this.#o), null)),
      (this.#s &&= (In(this.#s), null)),
      Ve &&
        (Ue(this.#t),
        (function (e = 1) {
          if (Ve) {
            for (var t = e, n = w; t--; ) n = bn(n);
            w = n;
          }
        })(),
        Ue(Ge())));
    var t = this.#n.onerror;
    let n = this.#n.failed;
    var r = !1,
      i = !1;
    let a = () => {
        r
          ? g
            ? console.warn(
                '%c[svelte] svelte_boundary_reset_noop\n%cA `<svelte:boundary>` `reset` function only resets the boundary the first time it is called\nhttps://svelte.dev/e/svelte_boundary_reset_noop',
                Le,
                Re
              )
            : console.warn('https://svelte.dev/e/svelte_boundary_reset_noop')
          : ((r = !0),
            i &&
              (function () {
                if (g) {
                  let e = /* @__PURE__ */ Error(
                    'svelte_boundary_reset_onerror\nA `<svelte:boundary>` `reset` function cannot be called while an error is still being handled\nhttps://svelte.dev/e/svelte_boundary_reset_onerror'
                  );
                  throw ((e.name = 'Svelte error'), e);
                }
                throw Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
              })(),
            this.#s !== null &&
              Rn(this.#s, () => {
                this.#s = null;
              }),
            this.#x(() => {
              this.#y();
            }));
      },
      o = (e) => {
        try {
          ((i = !0), t?.(e, a), (i = !1));
        } catch (e) {
          E(e, this.#i && this.#i.parent);
        }
        n &&
          (this.#s = this.#x(() => {
            try {
              return Nn(() => {
                var t = F;
                ((t.b = this),
                  (t.f |= 128),
                  n(
                    this.#e,
                    () => e,
                    () => a
                  ));
              });
            } catch (e) {
              return (E(e, this.#i.parent), null);
            }
          }));
      };
    st(() => {
      var t;
      try {
        t = this.transform_error(e);
      } catch (e) {
        E(e, this.#i && this.#i.parent);
        return;
      }
      typeof t == 'object' && t && typeof t.then == 'function'
        ? t.then(o, (e) => E(e, this.#i && this.#i.parent))
        : o(t);
    });
  }
};
function It(e, t, n, r) {
  let i = it() ? Ht : Wt;
  var a = e.filter((e) => !e.settled);
  if (n.length !== 0 || a.length !== 0) {
    var o = F,
      s = (function () {
        var e = F,
          t = P,
          n = T,
          r = D;
        if (g) var i = Qe;
        return function (a = !0) {
          (qn(e), Kn(t), Ze(n), a && (e.f & _e) === 0 && (r?.activate(), r?.apply()), g && (Bt(null), $e(i)));
        };
      })(),
      c = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null,
      l = Rt();
    n.length === 0
      ? c.then(() => u(t.map(i))).finally(l)
      : c
        ? c.then(() => {
            (s(), d(), Lt());
          })
        : d();
  } else r(t.map(i));
  function u(e) {
    if ((o.f & _e) === 0) {
      s();
      try {
        r(e);
      } catch (e) {
        E(e, o);
      }
      Lt();
    }
  }
  function d() {
    Promise.all(
      n.map((e) =>
        (function (e, t, n) {
          let r = F;
          r === null &&
            (function () {
              if (g) {
                let e = /* @__PURE__ */ Error(
                  'async_derived_orphan\nCannot create a `$derived(...)` with an `await` expression outside of an effect tree\nhttps://svelte.dev/e/async_derived_orphan'
                );
                throw ((e.name = 'Svelte error'), e);
              }
              throw Error('https://svelte.dev/e/async_derived_orphan');
            })();
          var i = void 0,
            a = en(p);
          g && (a.label = t ?? e.toString());
          var o = !P,
            s = /* @__PURE__ */ new Set();
          return (
            (function (e) {
              Tn(4718592, e);
            })(() => {
              var t = F;
              g &&
                (zt = {
                  effect: t,
                  effect_deps: /* @__PURE__ */ new Set(),
                  warned: !1
                });
              var c = ce();
              i = c.promise;
              try {
                Promise.resolve(e())
                  .then(c.resolve, (e) => {
                    e !== Fe && c.reject(e);
                  })
                  .finally(Lt);
              } catch (e) {
                (c.reject(e), Lt());
              }
              if (g) {
                if (zt) {
                  if (t.deps !== null) for (let e = 0; e < Xn; e += 1) zt.effect_deps.add(t.deps[e]);
                  if (Yn !== null) for (let e = 0; e < Yn.length; e += 1) zt.effect_deps.add(Yn[e]);
                }
                zt = null;
              }
              var l = D;
              if (o) {
                if ((t.f & ve) !== 0) var u = Rt();
                if (r.b.is_rendered()) l.async_deriveds.get(t)?.reject(Ut);
                else for (let e of s.values()) e.reject(Ut);
                (s.add(c), l.async_deriveds.set(t, c));
              }
              let d = (e, r = void 0) => {
                (g && (zt = null),
                  u?.(),
                  s.delete(c),
                  r !== Ut &&
                    (l.activate(),
                    r
                      ? ((a.f |= Ee), on(a, r))
                      : ((a.f & Ee) !== 0 && (a.f ^= Ee),
                        on(a, e),
                        g &&
                          n !== void 0 &&
                          (Vt.add(a),
                          setTimeout(() => {
                            Vt.has(a) &&
                              (t.f & _e) === 0 &&
                              ((function (e, t) {
                                g
                                  ? console.warn(
                                      `%c[svelte] await_waterfall\n%cAn async derived, \`${e}\` (${t}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app\nhttps://svelte.dev/e/await_waterfall`,
                                      Le,
                                      Re
                                    )
                                  : console.warn('https://svelte.dev/e/await_waterfall');
                              })(a.label, n),
                              Vt.delete(a));
                          }))),
                    l.deactivate()));
              };
              c.promise.then(d, (e) => d(null, e || 'unknown'));
            }),
            Dn(() => {
              for (let e of s) e.reject(Ut);
            }),
            g && (a.f |= Te),
            new Promise((e) => {
              function t(n) {
                function r() {
                  n === i ? e(a) : t(i);
                }
                n.then(r, r);
              }
              t(i);
            })
          );
        })(e)
      )
    )
      .then((e) => u([...t.map(i), ...e]))
      .catch((e) => E(e, o))
      .finally(l);
  }
}
function Lt(e = !0) {
  (qn(null), Kn(null), Ze(null), e && D?.deactivate(), g && (Bt(null), $e(null)));
}
function Rt() {
  var e = F,
    t = e.b,
    n = D,
    r = t.is_rendered();
  return (
    t.update_pending_count(1, n),
    n.increment(r, e),
    () => {
      (t.update_pending_count(-1, n), n.decrement(r, e));
    }
  );
}
var zt = null;
function Bt(e) {
  zt = e;
}
var Vt = /* @__PURE__ */ new Set();
function Ht(e) {
  return (
    F !== null && (F.f |= Se),
    {
      ctx: T,
      deps: null,
      effects: null,
      equals: Ke,
      f: 2050,
      fn: e,
      reactions: null,
      rv: 0,
      v: p,
      wv: 0,
      parent: F,
      ac: null
    }
  );
}
var Ut = Symbol('obsolete');
function Wt(e) {
  let t = Ht(e);
  return ((t.equals = qe), t);
}
function Gt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) In(t[n]);
  }
}
var Kt = [];
function qt(e) {
  var t,
    n = F,
    r = e.parent;
  if (!N && r !== null && 24576 & r.f)
    return (
      g
        ? console.warn(
            '%c[svelte] derived_inert\n%cReading a derived belonging to a now-destroyed effect may result in stale values\nhttps://svelte.dev/e/derived_inert',
            Le,
            Re
          )
        : console.warn('https://svelte.dev/e/derived_inert'),
      e.v
    );
  if ((qn(r), g)) {
    let r = Xt;
    Qt(/* @__PURE__ */ new Set());
    try {
      (y.call(Kt, e) &&
        (function () {
          if (g) {
            let e = /* @__PURE__ */ Error(
              'derived_references_self\nA derived value cannot reference itself recursively\nhttps://svelte.dev/e/derived_references_self'
            );
            throw ((e.name = 'Svelte error'), e);
          }
          throw Error('https://svelte.dev/e/derived_references_self');
        })(),
        Kt.push(e),
        (e.f &= -65537),
        Gt(e),
        (t = ar(e)));
    } finally {
      (qn(n), Qt(r), Kt.pop());
    }
  } else
    try {
      ((e.f &= -65537), Gt(e), (t = ar(e)));
    } finally {
      qn(n);
    }
  return t;
}
function Jt(e) {
  var t = qt(e);
  e.equals(t) ||
  ((e.wv = nr()),
  (D?.is_fork && e.deps !== null) ||
    (D === null ? (e.v = t) : (D.capture(e, t, !0), yt?.capture(e, t, !0)), e.deps !== null))
    ? N || (bt === null ? mt(e) : (En() || D?.is_fork) && bt.set(e, t))
    : pt(e, pe);
}
function Yt(e) {
  if (e.effects !== null) for (let t of e.effects) t.teardown && cr(t);
}
var Xt = /* @__PURE__ */ new Set(),
  Zt = /* @__PURE__ */ new Map();
function Qt(e) {
  Xt = e;
}
var $t = !1;
function en(e, t) {
  return {
    f: 0,
    v: e,
    reactions: null,
    equals: Ke,
    rv: 0,
    wv: 0
  };
}
function tn(e, t) {
  let n = en(e);
  var r;
  return ((r = n), P !== null && (Jn === null ? (Jn = [r]) : Jn.push(r)), n);
}
function nn(e, t = !1, n = !0) {
  let r = en(e);
  return (t || (r.equals = qe), d && n && T !== null && T.l !== null && (T.l.s ??= []).push(r), r);
}
function rn(e, t) {
  return (
    an(
      e,
      dr(() => I(e))
    ),
    t
  );
}
function an(e, t, n = !1) {
  P === null ||
    (Gn && (P.f & xe) === 0) ||
    !it() ||
    !(4325394 & P.f) ||
    (Jn !== null && y.call(Jn, e)) ||
    (function () {
      if (g) {
        let e = /* @__PURE__ */ Error(
          'state_unsafe_mutation\nUpdating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`\nhttps://svelte.dev/e/state_unsafe_mutation'
        );
        throw ((e.name = 'Svelte error'), e);
      }
      throw Error('https://svelte.dev/e/state_unsafe_mutation');
    })();
  let r = n ? dn(t) : t;
  return (g && Ye(r, e.label), on(e, r, Tt));
}
function on(e, t, n = null) {
  if (!e.equals(t)) {
    Zt.set(e, N ? t : e.v);
    var r = O.ensure();
    if ((r.capture(e, t), g)) {
      if (F !== null) {
        e.updated ??= /* @__PURE__ */ new Map();
        let t = (e.updated.get('')?.count ?? 0) + 1;
        if (
          (e.updated.set('', {
            error: null,
            count: t
          }),
          t > 5)
        ) {
          let t = Xe('updated at');
          if (t !== null) {
            let n = e.updated.get(t.stack);
            (n ||
              ((n = {
                error: t,
                count: 0
              }),
              e.updated.set(t.stack, n)),
              n.count++);
          }
        }
      }
      F !== null && (e.set_during_effect = !0);
    }
    if (2 & e.f) {
      let t = e;
      ((e.f & me) !== 0 && qt(t), bt === null && mt(t));
    }
    ((e.wv = nr()),
      ln(e, me, n),
      !it() ||
        F === null ||
        (F.f & pe) === 0 ||
        96 & F.f ||
        (Zn === null
          ? (function (e) {
              Zn = e;
            })([e])
          : Zn.push(e)),
      !r.is_fork && Xt.size > 0 && !$t && sn());
  }
  return t;
}
function sn() {
  $t = !1;
  for (let e of Xt) {
    let t;
    (e.f & pe) !== 0 && pt(e, he);
    try {
      t = rr(e);
    } catch {
      t = !0;
    }
    t && cr(e);
  }
  Xt.clear();
}
function cn(e) {
  an(e, e.v + 1);
}
function ln(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = it(), a = r.length, o = 0; o < a; o++) {
      var s = r[o],
        c = s.f;
      if (i || s !== F) {
        var l = (c & me) === 0;
        if ((l && pt(s, t), (c & xe) !== 0)) Xt.add(s);
        else if (2 & c) {
          var u = s;
          (bt?.delete(u), (c & Ce) === 0 && (c & fe && (F === null || (F.f & we) === 0) && (s.f |= Ce), ln(u, he, n)));
        } else if (l) {
          var d = s;
          ((c & le) !== 0 && kt !== null && kt.add(d), n === null ? Nt(d) : n.push(d));
        }
      }
    }
}
var un = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function dn(e) {
  if (typeof e != 'object' || !e || De in e) return e;
  let t = re(e);
  if (t !== te && t !== ne) return e;
  var n = /* @__PURE__ */ new Map(),
    r = _(e),
    i = tn(0),
    a = er,
    o = (e) => {
      if (er === a) return e();
      var t = P,
        n = er;
      (Kn(null), tr(a));
      var r = e();
      return (Kn(t), tr(n), r);
    };
  r &&
    (n.set('length', tn(e.length)),
    g &&
      (e = new Proxy(e, {
        get(e, t, n) {
          var r = Reflect.get(e, t, n);
          return mn.has(t)
            ? function (...e) {
                $t = !0;
                var t = r.apply(this, e);
                return (sn(), t);
              }
            : r;
        }
      })));
  var s = '';
  let c = !1;
  function l(e) {
    if (!c) {
      ((c = !0), Je(i, `${(s = e)} version`));
      for (let [e, t] of n) Je(t, fn(s, e));
      c = !1;
    }
  }
  return new Proxy(e, {
    defineProperty(e, t, r) {
      ('value' in r && !1 !== r.configurable && !1 !== r.enumerable && !1 !== r.writable) ||
        (function () {
          if (g) {
            let e = /* @__PURE__ */ Error(
              'state_descriptors_fixed\nProperty descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.\nhttps://svelte.dev/e/state_descriptors_fixed'
            );
            throw ((e.name = 'Svelte error'), e);
          }
          throw Error('https://svelte.dev/e/state_descriptors_fixed');
        })();
      var i = n.get(t);
      return (
        i === void 0
          ? o(() => {
              var e = tn(r.value);
              return (n.set(t, e), g && typeof t == 'string' && Je(e, fn(s, t)), e);
            })
          : an(i, r.value, !0),
        !0
      );
    },
    deleteProperty(e, t) {
      var r = n.get(t);
      if (r === void 0) {
        if (t in e) {
          let e = o(() => tn(p));
          (n.set(t, e), cn(i), g && Je(e, fn(s, t)));
        }
      } else (an(r, p), cn(i));
      return !0;
    },
    get(t, r, i) {
      if (r === De) return e;
      if (g && r === ke) return l;
      var a = n.get(r),
        c = r in t;
      if (
        (a !== void 0 ||
          (c && !C(t, r)?.writable) ||
          ((a = o(() => {
            var e = tn(dn(c ? t[r] : p));
            return (g && Je(e, fn(s, r)), e);
          })),
          n.set(r, a)),
        a !== void 0)
      ) {
        var u = I(a);
        return u === p ? void 0 : u;
      }
      return Reflect.get(t, r, i);
    },
    getOwnPropertyDescriptor(e, t) {
      var r = Reflect.getOwnPropertyDescriptor(e, t);
      if (r && 'value' in r) {
        var i = n.get(t);
        i && (r.value = I(i));
      } else if (r === void 0) {
        var a = n.get(t),
          o = a?.v;
        if (a !== void 0 && o !== p)
          return {
            enumerable: !0,
            configurable: !0,
            value: o,
            writable: !0
          };
      }
      return r;
    },
    has(e, t) {
      if (t === De) return !0;
      var r = n.get(t),
        i = (r !== void 0 && r.v !== p) || Reflect.has(e, t);
      return (r !== void 0 || (F !== null && (!i || C(e, t)?.writable))) &&
        (r === void 0 &&
          ((r = o(() => {
            var n = tn(i ? dn(e[t]) : p);
            return (g && Je(n, fn(s, t)), n);
          })),
          n.set(t, r)),
        I(r) === p)
        ? !1
        : i;
    },
    set(e, t, a, c) {
      var l = n.get(t),
        u = t in e;
      if (r && t === 'length')
        for (var d = a; d < l.v; d += 1) {
          var f = n.get(d + '');
          f === void 0 ? d in e && ((f = o(() => tn(p))), n.set(d + '', f), g && Je(f, fn(s, d))) : an(f, p);
        }
      l === void 0
        ? (u && !C(e, t)?.writable) || ((l = o(() => tn(void 0))), g && Je(l, fn(s, t)), an(l, dn(a)), n.set(t, l))
        : ((u = l.v !== p),
          an(
            l,
            o(() => dn(a))
          ));
      var m = Reflect.getOwnPropertyDescriptor(e, t);
      if ((m?.set && m.set.call(c, a), !u)) {
        if (r && typeof t == 'string') {
          var h = n.get('length'),
            _ = Number(t);
          Number.isInteger(_) && _ >= h.v && an(h, _ + 1);
        }
        cn(i);
      }
      return !0;
    },
    ownKeys(e) {
      I(i);
      var t = Reflect.ownKeys(e).filter((e) => {
        var t = n.get(e);
        return t === void 0 || t.v !== p;
      });
      for (var [r, a] of n) a.v === p || r in e || t.push(r);
      return t;
    },
    setPrototypeOf() {
      (function () {
        if (g) {
          let e = /* @__PURE__ */ Error(
            'state_prototype_fixed\nCannot set prototype of `$state` object\nhttps://svelte.dev/e/state_prototype_fixed'
          );
          throw ((e.name = 'Svelte error'), e);
        }
        throw Error('https://svelte.dev/e/state_prototype_fixed');
      })();
    }
  });
}
function fn(e, t) {
  return typeof t == 'symbol'
    ? `${e}[Symbol(${t.description ?? ''})]`
    : un.test(t)
      ? `${e}.${t}`
      : /^\d+$/.test(t)
        ? `${e}[${t}]`
        : `${e}['${t}']`;
}
function pn(e) {
  try {
    if (typeof e == 'object' && e && De in e) return e[De];
  } catch {}
  return e;
}
var mn = new Set(['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']),
  hn,
  j,
  M,
  gn;
function _n() {
  if (hn === void 0) {
    ((hn = window), (j = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((M = C(t, 'firstChild').get),
      (gn = C(t, 'nextSibling').get),
      ie(e) && ((e[je] = void 0), (e[Ae] = null), (e[Me] = void 0), (e.__e = void 0)),
      ie(n) && (n[Ne] = void 0),
      g &&
        ((e.__svelte_meta = null),
        (function () {
          let e = Array.prototype,
            t = Array.__svelte_cleanup;
          t && t();
          let { indexOf: n, lastIndexOf: r, includes: i } = e;
          ((e.indexOf = function (e, t) {
            let r = n.call(this, e, t);
            if (r === -1) {
              for (let n = t ?? 0; n < this.length; n += 1)
                if (pn(this[n]) === e) {
                  Be('array.indexOf(...)');
                  break;
                }
            }
            return r;
          }),
            (e.lastIndexOf = function (e, t) {
              let n = r.call(this, e, t ?? this.length - 1);
              if (n === -1) {
                for (let n = 0; n <= (t ?? this.length - 1); n += 1)
                  if (pn(this[n]) === e) {
                    Be('array.lastIndexOf(...)');
                    break;
                  }
              }
              return n;
            }),
            (e.includes = function (e, t) {
              let n = i.call(this, e, t);
              if (!n) {
                for (let t = 0; t < this.length; t += 1)
                  if (pn(this[t]) === e) {
                    Be('array.includes(...)');
                    break;
                  }
              }
              return n;
            }),
            (Array.__svelte_cleanup = () => {
              ((e.indexOf = n), (e.lastIndexOf = r), (e.includes = i));
            }));
        })()));
  }
}
function vn(e = '') {
  return document.createTextNode(e);
}
function yn(e) {
  return M.call(e);
}
function bn(e) {
  return gn.call(e);
}
function xn(e, t, n) {
  let r = n ? { is: n } : void 0;
  return document.createElementNS(t ?? 'http://www.w3.org/1999/xhtml', e, r);
}
function Sn(e) {
  if (e.nodeValue.length < 65536) return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === 3; ) (t.remove(), (e.nodeValue += t.nodeValue), (t = e.nextSibling));
}
function Cn(e) {
  var t = P,
    n = F;
  (Kn(null), qn(null));
  try {
    return e();
  } finally {
    (Kn(t), qn(n));
  }
}
function wn(e) {
  (F === null &&
    (P === null &&
      (function (e) {
        if (g) {
          let t = /* @__PURE__ */ Error(
            `effect_orphan\n\`${e}\` can only be used inside an effect (e.g. during component initialisation)\nhttps://svelte.dev/e/effect_orphan`
          );
          throw ((t.name = 'Svelte error'), t);
        }
        throw Error('https://svelte.dev/e/effect_orphan');
      })(e),
    (function () {
      if (g) {
        let e = /* @__PURE__ */ Error(
          'effect_in_unowned_derived\nEffect cannot be created inside a `$derived` value that was not itself created inside an effect\nhttps://svelte.dev/e/effect_in_unowned_derived'
        );
        throw ((e.name = 'Svelte error'), e);
      }
      throw Error('https://svelte.dev/e/effect_in_unowned_derived');
    })()),
    N &&
      (function (e) {
        if (g) {
          let t = /* @__PURE__ */ Error(
            `effect_in_teardown\n\`${e}\` cannot be used inside an effect cleanup function\nhttps://svelte.dev/e/effect_in_teardown`
          );
          throw ((t.name = 'Svelte error'), t);
        }
        throw Error('https://svelte.dev/e/effect_in_teardown');
      })(e));
}
function Tn(e, t) {
  var n = F;
  if (g) for (; n !== null && (n.f & xe) !== 0; ) n = n.parent;
  n !== null && (n.f & ge) !== 0 && (e |= ge);
  var r = {
    ctx: T,
    deps: null,
    nodes: null,
    f: e | 2560,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  (g && (r.component_function = et), D?.register_created_effect(r));
  var i = r;
  if (4 & e) wt === null ? O.ensure().schedule(r) : wt.push(r);
  else if (t !== null) {
    try {
      cr(r);
    } catch (e) {
      throw (In(r), e);
    }
    i.deps === null &&
      i.teardown === null &&
      i.nodes === null &&
      i.first === i.last &&
      (i.f & Se) === 0 &&
      ((i = i.first), (e & le) !== 0 && (e & be) !== 0 && i !== null && (i.f |= be));
  }
  if (
    i !== null &&
    ((i.parent = n),
    n !== null &&
      (function (e, t) {
        var n = t.last;
        n === null ? (t.last = t.first = e) : ((n.next = e), (e.prev = n), (t.last = e));
      })(i, n),
    P !== null && 2 & P.f && (e & de) === 0)
  ) {
    var a = P;
    (a.effects ??= []).push(i);
  }
  return r;
}
function En() {
  return P !== null && !Gn;
}
function Dn(e) {
  let t = Tn(8, null);
  return (pt(t, pe), (t.teardown = e), t);
}
function On(e) {
  (wn('$effect'), g && S(e, 'name', { value: '$effect' }));
  var t = F.f;
  if (!(!P && (t & ue) !== 0 && (t & ve) === 0)) return kn(e);
  var n = T;
  (n.e ??= []).push(e);
}
function kn(e) {
  return Tn(1048580, e);
}
function An(e) {
  return Tn(4, e);
}
function jn(e, t = 0) {
  return Tn(8 | t, e);
}
function Mn(e, t = 0) {
  var n = Tn(le | t, e);
  return (g && (n.dev_stack = Qe), n);
}
function Nn(e) {
  return Tn(524320, e);
}
function Pn(e) {
  var t = e.teardown;
  if (t !== null) {
    let e = N,
      n = P;
    (Wn(!0), Kn(null));
    try {
      t.call(null);
    } finally {
      (Wn(e), Kn(n));
    }
  }
}
function Fn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    let e = n.ac;
    e !== null &&
      Cn(() => {
        e.abort(Fe);
      });
    var r = n.next;
    ((n.f & de) === 0 ? In(n, t) : (n.parent = null), (n = r));
  }
}
function In(e, t = !0) {
  var n = !1;
  ((t || 262144 & e.f) &&
    e.nodes !== null &&
    e.nodes.end !== null &&
    ((function (e, t) {
      for (; e !== null; ) {
        var n = e === t ? null : bn(e);
        (e.remove(), (e = n));
      }
    })(e.nodes.start, e.nodes.end),
    (n = !0)),
    pt(e, ye),
    Fn(e, t && !n),
    sr(e, 0));
  var r = e.nodes && e.nodes.t;
  if (r !== null) for (let e of r) e.stop();
  (Pn(e), (e.f ^= ye), (e.f |= _e));
  var i = e.parent;
  (i !== null && i.first !== null && Ln(e),
    g && (e.component_function = null),
    (e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null));
}
function Ln(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function Rn(e, t, n = !0) {
  var r = [];
  zn(e, r, !0);
  var i = () => {
      (n && In(e), t && t());
    },
    a = r.length;
  if (a > 0) {
    var o = () => --a || i();
    for (var s of r) s.out(o);
  } else i();
}
function zn(e, t, n) {
  if ((e.f & ge) === 0) {
    e.f ^= ge;
    var r = e.nodes && e.nodes.t;
    if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
    for (var i = e.first; i !== null; ) {
      var a = i.next;
      ((i.f & de) === 0 && zn(i, t, ((i.f & be) !== 0 || ((i.f & ue) !== 0 && (e.f & le) !== 0)) && n), (i = a));
    }
  }
}
function Bn(e) {
  Vn(e, !0);
}
function Vn(e, t) {
  if ((e.f & ge) !== 0) {
    ((e.f ^= ge), (e.f & pe) === 0 && (pt(e, me), O.ensure().schedule(e)));
    for (var n = e.first; n !== null; ) {
      var r = n.next;
      (Vn(n, ((n.f & be) !== 0 || (n.f & ue) !== 0) && t), (n = r));
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null) for (let e of i) (e.is_global || t) && e.in();
  }
}
function Hn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : bn(n);
      (t.append(n), (n = i));
    }
}
var Un = !1,
  N = !1;
function Wn(e) {
  N = e;
}
var P = null,
  Gn = !1;
function Kn(e) {
  P = e;
}
var F = null;
function qn(e) {
  F = e;
}
var Jn = null,
  Yn = null,
  Xn = 0,
  Zn = null,
  Qn = 1,
  $n = 0,
  er = $n;
function tr(e) {
  er = e;
}
function nr() {
  return ++Qn;
}
function rr(e) {
  var t = e.f;
  if ((t & me) !== 0) return !0;
  if ((2 & t && (e.f &= -65537), (t & he) !== 0)) {
    for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if ((rr(a) && Jt(a), a.wv > e.wv)) return !0;
    }
    (t & fe) !== 0 && bt === null && pt(e, pe);
  }
  return !1;
}
function ir(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && (Jn === null || !y.call(Jn, e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      2 & a.f ? ir(a, t, !1) : t === a && (n ? pt(a, me) : (a.f & pe) !== 0 && pt(a, he), Nt(a));
    }
}
function ar(e) {
  var t = Yn,
    n = Xn,
    r = Zn,
    i = P,
    a = Jn,
    o = T,
    s = Gn,
    c = er,
    l = e.f;
  ((Yn = null),
    (Xn = 0),
    (Zn = null),
    (P = 96 & l ? null : e),
    (Jn = null),
    Ze(e.ctx),
    (Gn = !1),
    (er = ++$n),
    e.ac !== null &&
      (Cn(() => {
        e.ac.abort(Fe);
      }),
      (e.ac = null)));
  try {
    e.f |= we;
    var u = (0, e.fn)();
    e.f |= ve;
    var d = e.deps,
      f = D?.is_fork;
    if (Yn !== null) {
      var p;
      if ((f || sr(e, Xn), d !== null && Xn > 0))
        for (d.length = Xn + Yn.length, p = 0; p < Yn.length; p++) d[Xn + p] = Yn[p];
      else e.deps = d = Yn;
      if (En() && (e.f & fe) !== 0) for (p = Xn; p < d.length; p++) (d[p].reactions ??= []).push(e);
    } else !f && d !== null && Xn < d.length && (sr(e, Xn), (d.length = Xn));
    if (it() && Zn !== null && !Gn && d !== null && !(6146 & e.f)) for (p = 0; p < Zn.length; p++) ir(Zn[p], e);
    if (i !== null && i !== e) {
      if (($n++, i.deps !== null)) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
      if (t !== null) for (let e of t) e.rv = $n;
      Zn !== null && (r === null ? (r = Zn) : r.push(...Zn));
    }
    return ((e.f & Ee) !== 0 && (e.f ^= Ee), u);
  } catch (e) {
    return ut(e);
  } finally {
    ((e.f ^= we), (Yn = t), (Xn = n), (Zn = r), (P = i), (Jn = a), Ze(o), (Gn = s), (er = c));
  }
}
function or(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = v.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? (n = t.reactions = null) : ((n[r] = n[i]), n.pop());
    }
  }
  if (n === null && 2 & t.f && (Yn === null || !y.call(Yn, t))) {
    var a = t;
    ((a.f & fe) !== 0 && ((a.f ^= fe), (a.f &= -65537)),
      a.v !== p && mt(a),
      (function (e) {
        if (e.effects !== null)
          for (let t of e.effects)
            (t.teardown || t.ac) &&
              (t.teardown?.(), t.ac?.abort(Fe), (t.teardown = ae), (t.ac = null), sr(t, 0), Fn(t));
      })(a),
      sr(a, 0));
  }
}
function sr(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) or(e, n[r]);
}
function cr(e) {
  var t = e.f;
  if ((t & _e) === 0) {
    pt(e, pe);
    var n = F,
      r = Un;
    if (((F = e), (Un = !0), g)) {
      var i = et;
      tt(e.component_function);
      var a = Qe;
      $e(e.dev_stack ?? Qe);
    }
    try {
      (16777232 & t
        ? (function (e) {
            for (var t = e.first; t !== null; ) {
              var n = t.next;
              ((t.f & ue) === 0 && In(t), (t = n));
            }
          })(e)
        : Fn(e),
        Pn(e));
      var o = ar(e);
      ((e.teardown = typeof o == 'function' ? o : null), (e.wv = Qn));
    } finally {
      ((Un = r), (F = n), g && (tt(i), $e(a)));
    }
  }
}
function I(e) {
  var t,
    n = !!(2 & e.f);
  if (P !== null && !Gn && !((F !== null && (F.f & _e) !== 0) || (Jn !== null && y.call(Jn, e)))) {
    var r = P.deps;
    if ((P.f & we) !== 0)
      e.rv < $n &&
        ((e.rv = $n), Yn === null && r !== null && r[Xn] === e ? Xn++ : Yn === null ? (Yn = [e]) : Yn.push(e));
    else {
      (P.deps ??= []).push(e);
      var i = e.reactions;
      i === null ? (e.reactions = [P]) : y.call(i, P) || i.push(P);
    }
  }
  if (g) {
    if (!Gn && zt && !zt.warned && (zt.effect.f & we) === 0 && !zt.effect_deps.has(e)) {
      ((zt.warned = !0),
        (t = e.label),
        g
          ? console.warn(
              `%c[svelte] await_reactivity_loss\n%cDetected reactivity loss when reading \`${t}\`. This happens when state is read in an async function after an earlier \`await\`\nhttps://svelte.dev/e/await_reactivity_loss`,
              Le,
              Re
            )
          : console.warn('https://svelte.dev/e/await_reactivity_loss'));
      var a = Xe('traced at');
      a && console.warn(a);
    }
    Vt.delete(e);
  }
  if (N && Zt.has(e)) return Zt.get(e);
  if (n) {
    var o = e;
    if (N) {
      var s = o.v;
      return ((((o.f & pe) === 0 && o.reactions !== null) || ur(o)) && (s = qt(o)), Zt.set(o, s), s);
    }
    var c = (o.f & fe) === 0 && !Gn && P !== null && (Un || (P.f & fe) !== 0),
      l = (o.f & ve) === 0;
    (rr(o) && (c && (o.f |= fe), Jt(o)), c && !l && (Yt(o), lr(o)));
  }
  if (bt?.has(e)) return bt.get(e);
  if ((e.f & Ee) !== 0) throw e.v;
  return e.v;
}
function lr(e) {
  if (((e.f |= fe), e.deps !== null))
    for (let t of e.deps) ((t.reactions ??= []).push(e), 2 & t.f && (t.f & fe) === 0 && (Yt(t), lr(t)));
}
function ur(e) {
  if (e.v === p) return !0;
  if (e.deps === null) return !1;
  for (let t of e.deps) if (Zt.has(t) || (2 & t.f && ur(t))) return !0;
  return !1;
}
function dr(e) {
  var t = Gn;
  try {
    return ((Gn = !0), e());
  } finally {
    Gn = t;
  }
}
function fr(e) {
  if (typeof e == 'object' && e && !(e instanceof EventTarget)) {
    if (De in e) pr(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        let n = e[t];
        typeof n == 'object' && n && De in n && pr(n);
      }
  }
}
function pr(e, t = /* @__PURE__ */ new Set()) {
  if (!(typeof e != 'object' || !e || e instanceof EventTarget || t.has(e))) {
    (t.add(e), e instanceof Date && e.getTime());
    for (let n in e)
      try {
        pr(e[n], t);
      } catch {}
    let n = re(e);
    if (
      n !== Object.prototype &&
      n !== Array.prototype &&
      n !== Map.prototype &&
      n !== Set.prototype &&
      n !== Date.prototype
    ) {
      let t = ee(n);
      for (let n in t) {
        let r = t[n].get;
        if (r)
          try {
            r.call(e);
          } catch {}
      }
    }
  }
}
var mr = Symbol('events'),
  hr = /* @__PURE__ */ new Set(),
  gr = /* @__PURE__ */ new Set(),
  _r = null;
function vr(e) {
  var t = this,
    n = t.ownerDocument,
    r = e.type,
    i = e.composedPath?.() || [],
    a = i[0] || e.target;
  _r = e;
  var o = 0,
    s = _r === e && e[mr];
  if (s) {
    var c = i.indexOf(s);
    if (c !== -1 && (t === document || t === window)) return void (e[mr] = t);
    var l = i.indexOf(t);
    if (l === -1) return;
    c <= l && (o = c);
  }
  if ((a = i[o] || e.target) !== t) {
    S(e, 'currentTarget', {
      configurable: !0,
      get: () => a || n
    });
    var u = P,
      d = F;
    (Kn(null), qn(null));
    try {
      for (var f, p = []; a !== null; ) {
        var m = a.assignedSlot || a.parentNode || a.host || null;
        try {
          var h = a[mr]?.[r];
          h == null || (a.disabled && e.target !== a) || h.call(a, e);
        } catch (e) {
          f ? p.push(e) : (f = e);
        }
        if (e.cancelBubble || m === t || m === null) break;
        a = m;
      }
      if (f) {
        for (let e of p)
          queueMicrotask(() => {
            throw e;
          });
        throw f;
      }
    } finally {
      ((e[mr] = t), delete e.currentTarget, Kn(u), qn(d));
    }
  }
}
var yr =
  globalThis?.window?.trustedTypes &&
  globalThis.window.trustedTypes.createPolicy('svelte-trusted-html', { createHTML: (e) => e });
function br(e) {
  var t = xn('template');
  return (
    (t.innerHTML = (function (e) {
      return yr?.createHTML(e) ?? e;
    })(e.replaceAll('<!>', '<!---->'))),
    t.content
  );
}
function xr(e, t) {
  var n = F;
  n.nodes === null &&
    (n.nodes = {
      start: e,
      end: t,
      a: null,
      t: null
    });
}
function Sr(e, t) {
  var n,
    r = !!(1 & t),
    i = !!(2 & t),
    a = !e.startsWith('<!>');
  return () => {
    if (Ve) return (xr(w, null), w);
    n === void 0 && ((n = br(a ? e : '<!>' + e)), r || (n = yn(n)));
    var t = i || j ? document.importNode(n, !0) : n.cloneNode(!0);
    return (r ? xr(yn(t), t.lastChild) : xr(t, t), t);
  };
}
function Cr(e, t) {
  if (Ve) {
    var n = F;
    (((n.f & ve) !== 0 && n.nodes.end !== null) || (n.nodes.end = w), We());
    return;
  }
  e !== null && e.before(t);
}
var wr = ['touchstart', 'touchmove'];
function Tr(e) {
  return wr.includes(e);
}
function Er(e, t) {
  return kr(e, t);
}
function Dr(e, t) {
  (_n(), (t.intro = t.intro ?? !1));
  let n = t.target,
    r = Ve,
    i = w;
  try {
    for (var a = yn(n); a && (a.nodeType !== 8 || a.data !== '['); ) a = bn(a);
    if (!a) throw f;
    (He(!0), Ue(a));
    let r = kr(e, {
      ...t,
      anchor: a
    });
    return (He(!1), r);
  } catch (r) {
    if (r instanceof Error && r.message.split('\n').some((e) => e.startsWith('https://svelte.dev/e/'))) throw r;
    return (
      r !== f && console.warn('Failed to hydrate: ', r),
      !1 === t.recover &&
        (function () {
          if (g) {
            let e = /* @__PURE__ */ Error(
              'hydration_failed\nFailed to hydrate the application\nhttps://svelte.dev/e/hydration_failed'
            );
            throw ((e.name = 'Svelte error'), e);
          }
          throw Error('https://svelte.dev/e/hydration_failed');
        })(),
      _n(),
      (n.textContent = ''),
      He(!1),
      Er(e, t)
    );
  } finally {
    (He(r), Ue(i));
  }
}
var Or = /* @__PURE__ */ new Map();
function kr(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: o = !0, transformError: s }) {
  _n();
  var c = void 0,
    l = (function (e) {
      O.ensure();
      let t = Tn(524352, e);
      return (e = {}) =>
        new Promise((n) => {
          e.outro
            ? Rn(t, () => {
                (In(t), n(void 0));
              })
            : (In(t), n(void 0));
        });
    })(() => {
      var o = n ?? t.appendChild(vn());
      (function (e, t, n, r) {
        new A(e, t, n, r);
      })(
        o,
        { pending: () => {} },
        (t) => {
          if (
            (nt({}),
            a && (T.c = a),
            i && (r.$$events = i),
            Ve && xr(t, null),
            (c = e(t, r) || {}),
            Ve && ((F.nodes.end = w), w === null || w.nodeType !== 8 || w.data !== ']'))
          )
            throw (ze(), f);
          rt();
        },
        s
      );
      var l = /* @__PURE__ */ new Set(),
        u = (e) => {
          for (var n = 0; n < e.length; n++) {
            var r = e[n];
            if (!l.has(r)) {
              l.add(r);
              var i = Tr(r);
              for (let e of [t, document]) {
                var a = Or.get(e);
                a === void 0 && ((a = /* @__PURE__ */ new Map()), Or.set(e, a));
                var o = a.get(r);
                o === void 0 ? (e.addEventListener(r, vr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
              }
            }
          }
        };
      return (
        u(b(hr)),
        gr.add(u),
        () => {
          for (var e of l)
            for (let n of [t, document]) {
              var r = Or.get(n),
                i = r.get(e);
              --i == 0 ? (n.removeEventListener(e, vr), r.delete(e), r.size === 0 && Or.delete(n)) : r.set(e, i);
            }
          (gr.delete(u), o !== n && o.parentNode?.removeChild(o));
        }
      );
    });
  return (Ar.set(c, l), c);
}
var Ar = /* @__PURE__ */ new WeakMap();
function jr(e, t) {
  let n = Ar.get(e);
  return n
    ? (Ar.delete(e), n(t))
    : (g &&
        (De in e
          ? g
            ? console.warn(
                '%c[svelte] state_proxy_unmount\n%cTried to unmount a state proxy, rather than a component\nhttps://svelte.dev/e/state_proxy_unmount',
                Le,
                Re
              )
            : console.warn('https://svelte.dev/e/state_proxy_unmount')
          : g
            ? console.warn(
                '%c[svelte] lifecycle_double_unmount\n%cTried to unmount a component that was not mounted\nhttps://svelte.dev/e/lifecycle_double_unmount',
                Le,
                Re
              )
            : console.warn('https://svelte.dev/e/lifecycle_double_unmount')),
      Promise.resolve());
}
var Mr = class {
  anchor;
  #e = /* @__PURE__ */ new Map();
  #t = /* @__PURE__ */ new Map();
  #n = /* @__PURE__ */ new Map();
  #r = /* @__PURE__ */ new Set();
  #i = !0;
  constructor(e, t = !0) {
    ((this.anchor = e), (this.#i = t));
  }
  #a = (e) => {
    if (this.#e.has(e)) {
      var t = this.#e.get(e),
        n = this.#t.get(t);
      if (n) (Bn(n), this.#r.delete(t));
      else {
        var r = this.#n.get(t);
        r &&
          (this.#t.set(t, r.effect),
          this.#n.delete(t),
          g && (r.fragment.lastChild[Pe] = this.anchor),
          r.fragment.lastChild.remove(),
          this.anchor.before(r.fragment),
          (n = r.effect));
      }
      for (let [t, n] of this.#e) {
        if ((this.#e.delete(t), t === e)) break;
        let r = this.#n.get(n);
        r && (In(r.effect), this.#n.delete(n));
      }
      for (let [e, r] of this.#t) {
        if (e === t || this.#r.has(e)) continue;
        let i = () => {
          if (Array.from(this.#e.values()).includes(e)) {
            var t = document.createDocumentFragment();
            (Hn(r, t),
              t.append(vn()),
              this.#n.set(e, {
                effect: r,
                fragment: t
              }));
          } else In(r);
          (this.#r.delete(e), this.#t.delete(e));
        };
        this.#i || !n ? (this.#r.add(e), Rn(r, i, !1)) : i();
      }
    }
  };
  ensure(e, t) {
    var n = D;
    (!t ||
      this.#t.has(e) ||
      this.#n.has(e) ||
      this.#t.set(
        e,
        Nn(() => t(this.anchor))
      ),
      this.#e.set(n, e),
      Ve && (this.anchor = w),
      this.#a(n));
  }
};
if (g) {
  function e(e) {
    if (!(e in globalThis)) {
      let t;
      Object.defineProperty(globalThis, e, {
        configurable: !0,
        get: () => {
          if (t !== void 0) return t;
          (function (e) {
            if (g) {
              let t = /* @__PURE__ */ Error(
                `rune_outside_svelte\nThe \`${e}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files\nhttps://svelte.dev/e/rune_outside_svelte`
              );
              throw ((t.name = 'Svelte error'), t);
            }
            throw Error('https://svelte.dev/e/rune_outside_svelte');
          })(e);
        },
        set: (e) => {
          t = e;
        }
      });
    }
  }
  (e('$state'), e('$effect'), e('$derived'), e('$inspect'), e('$props'), e('$bindable'));
}
function Nr(e) {
  var t, n;
  (T === null && Ie('onMount'),
    d && T.l !== null
      ? ((t = T),
        (n = t.l),
        (n.u ??= {
          a: [],
          b: [],
          m: []
        })).m.push(e)
      : On(() => {
          let t = dr(e);
          if (typeof t == 'function') return t;
        }));
}
var Pr = /* @__PURE__ */ new Map();
function Fr(e, t, n = !1) {
  var r;
  Ve && ((r = w), We());
  var i = new Mr(e);
  function a(e, t) {
    if (Ve) {
      var n = (function (e) {
        if (!e || e.nodeType !== 8) throw (ze(), f);
        return e.data;
      })(r);
      if (e !== parseInt(n.substring(1))) {
        var a = Ge();
        (Ue(a), (i.anchor = a), He(!1), i.ensure(e, t), He(!0));
        return;
      }
    }
    i.ensure(e, t);
  }
  Mn(
    () => {
      var e = !1;
      (t((t, n = 0) => {
        ((e = !0), a(n, t));
      }),
        e || a(-1, null));
    },
    n ? be : 0
  );
}
function Ir(e, t) {
  An(() => {
    var n = e.getRootNode(),
      r = n.host ? n : (n.head ?? n.ownerDocument.head);
    if (!r.querySelector('#' + t.hash)) {
      let e = xn('style');
      ((e.id = t.hash),
        (e.textContent = t.code),
        r.appendChild(e),
        g &&
          (function (e, t) {
            var n = Pr.get(e);
            (n || ((n = /* @__PURE__ */ new Set()), Pr.set(e, n)), n.add(t));
          })(t.hash, e));
    }
  });
}
function Lr(e) {
  var t,
    n,
    r = '';
  if (typeof e == 'string' || typeof e == 'number') r += e;
  else if (typeof e == 'object')
    if (Array.isArray(e)) {
      var i = e.length;
      for (t = 0; t < i; t++) e[t] && (n = Lr(e[t])) && (r && (r += ' '), (r += n));
    } else for (n in e) e[n] && (r && (r += ' '), (r += n));
  return r;
}
function Rr(e) {
  return typeof e == 'object'
    ? (function () {
        for (var e, t, n = 0, r = '', i = arguments.length; n < i; n++)
          (e = arguments[n]) && (t = Lr(e)) && (r && (r += ' '), (r += t));
        return r;
      })(e)
    : (e ?? '');
}
var zr = [...' 	\n\r\f\xA0\v﻿'];
function Br(e, t, n, r, i, a) {
  var o = e[je];
  if (Ve || o !== n || o === void 0) {
    var s = (function (e, t, n) {
      var r = e == null ? '' : '' + e;
      if ((t && (r = r ? r + ' ' + t : t), n)) {
        for (var i of Object.keys(n))
          if (n[i]) r = r ? r + ' ' + i : i;
          else if (r.length)
            for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0; ) {
              var s = o + a;
              (o !== 0 && !zr.includes(r[o - 1])) || (s !== r.length && !zr.includes(r[s]))
                ? (o = s)
                : (r = (o === 0 ? '' : r.substring(0, o)) + r.substring(s + 1));
            }
      }
      return r === '' ? null : r;
    })(n, r, a);
    ((Ve && s === e.getAttribute('class')) ||
      (s == null ? e.removeAttribute('class') : t ? (e.className = s) : e.setAttribute('class', s)),
      (e[je] = n));
  } else if (a && i !== a)
    for (var c in a) {
      var l = !!a[c];
      (i != null && l === !!i[c]) || e.classList.toggle(c, l);
    }
  return a;
}
function L(e, t, n) {
  var r = C(e, t);
  r &&
    r.set &&
    ((e[t] = n),
    Dn(() => {
      e[t] = null;
    }));
}
function Vr(e, t) {
  return e === t || e?.[De] === t;
}
function Hr(e = {}, t, n, r) {
  var i = T.r,
    a = F;
  return (
    An(() => {
      var o, s;
      return (
        jn(() => {
          ((o = s),
            (s = r?.() || []),
            dr(() => {
              Vr(n(...s), e) || (t(e, ...s), o && Vr(n(...o), e) && t(null, ...o));
            }));
        }),
        () => {
          let r = a;
          for (; r !== i && r.parent !== null && r.parent.f & ye; ) r = r.parent;
          let o = r.teardown;
          r.teardown = () => {
            (s && Vr(n(...s), e) && t(null, ...s), o?.());
          };
        }
      );
    }),
    e
  );
}
function Ur(e = !1) {
  let t = T,
    n = t.l.u;
  if (!n) return;
  let r = () => fr(t.s);
  if (e) {
    let e = 0,
      n = {},
      i = Ht(() => {
        let r = !1,
          i = t.s;
        for (let e in i) i[e] !== n[e] && ((n[e] = i[e]), (r = !0));
        return (r && e++, e);
      });
    r = () => I(i);
  }
  var i;
  (n.b.length &&
    ((i = () => {
      (R(t, r), se(n.b));
    }),
    wn('$effect.pre'),
    g && S(i, 'name', { value: '$effect.pre' }),
    Tn(1048584, i)),
    On(() => {
      let e = dr(() => n.m.map(oe));
      return () => {
        for (let t of e) typeof t == 'function' && t();
      };
    }),
    n.a.length &&
      On(() => {
        (R(t, r), se(n.a));
      }));
}
function R(e, t) {
  if (e.l.s) for (let t of e.l.s) I(t);
  t();
}
function z(e, t, n, r) {
  var i = !d || !!(2 & n),
    a = !!(8 & n),
    o = !!(16 & n),
    s = r,
    c = !0,
    l = void 0,
    u = () => (o && i ? ((l ??= Ht(r)), I(l)) : (c && ((c = !1), (s = o ? dr(r) : r)), s));
  let f;
  if (a) {
    var p = De in e || Oe in e;
    f = C(e, t)?.set ?? (p && t in e ? (n) => (e[t] = n) : void 0);
  }
  var m,
    h,
    _ = !1;
  if (
    (a
      ? ([m, _] = (function (e) {
          var t = _t;
          try {
            return ((_t = !1), [e(), _t]);
          } finally {
            _t = t;
          }
        })(() => e[t]))
      : (m = e[t]),
    m === void 0 &&
      r !== void 0 &&
      ((m = u()),
      f &&
        (i &&
          (function (e) {
            if (g) {
              let t = /* @__PURE__ */ Error(
                `props_invalid_value\nCannot do \`bind:${e}={undefined}\` when \`${e}\` has a fallback value\nhttps://svelte.dev/e/props_invalid_value`
              );
              throw ((t.name = 'Svelte error'), t);
            }
            throw Error('https://svelte.dev/e/props_invalid_value');
          })(t),
        f(m))),
    (h = i
      ? () => {
          var n = e[t];
          return n === void 0 ? u() : ((c = !0), n);
        }
      : () => {
          var n = e[t];
          return (n !== void 0 && (s = void 0), n === void 0 ? s : n);
        }),
    i && !(4 & n))
  )
    return h;
  if (f) {
    var v = e.$$legacy;
    return function (e, t) {
      return arguments.length > 0 ? ((i && t && !v && !_) || f(t ? h() : e), e) : h();
    };
  }
  var y = !1,
    b = (1 & n ? Ht : Wt)(() => ((y = !1), h()));
  (g && (b.label = t), a && I(b));
  var x = F;
  return function (e, t) {
    if (arguments.length > 0) {
      let n = t ? I(b) : i && a ? dn(e) : e;
      return (an(b, n), (y = !0), s !== void 0 && (s = n), e);
    }
    return (N && y) || (x.f & _e) !== 0 ? b.v : I(b);
  };
}
var Wr = class {
    #e;
    #t;
    constructor(e) {
      var t = /* @__PURE__ */ new Map(),
        n = (e, n) => {
          var r = nn(n, !1, !1);
          return (t.set(e, r), r);
        };
      let r = new Proxy(
        {
          ...(e.props || {}),
          $$events: {}
        },
        {
          get: (e, r) => I(t.get(r) ?? n(r, Reflect.get(e, r))),
          has: (e, r) => r === Oe || (I(t.get(r) ?? n(r, Reflect.get(e, r))), Reflect.has(e, r)),
          set: (e, r, i) => (an(t.get(r) ?? n(r, i), i), Reflect.set(e, r, i))
        }
      );
      ((this.#t = (e.hydrate ? Dr : Er)(e.component, {
        target: e.target,
        anchor: e.anchor,
        props: r,
        context: e.context,
        intro: e.intro ?? !1,
        recover: e.recover,
        transformError: e.transformError
      })),
        (e?.props?.$$host && !1 !== e.sync) || k(),
        (this.#e = r.$$events));
      for (let e of Object.keys(this.#t))
        e !== '$set' &&
          e !== '$destroy' &&
          e !== '$on' &&
          S(this, e, {
            get() {
              return this.#t[e];
            },
            set(t) {
              this.#t[e] = t;
            },
            enumerable: !0
          });
      ((this.#t.$set = (e) => {
        Object.assign(r, e);
      }),
        (this.#t.$destroy = () => {
          jr(this.#t);
        }));
    }
    $set(e) {
      this.#t.$set(e);
    }
    $on(e, t) {
      this.#e[e] = this.#e[e] || [];
      let n = (...e) => t.call(this, ...e);
      return (
        this.#e[e].push(n),
        () => {
          this.#e[e] = this.#e[e].filter((e) => e !== n);
        }
      );
    }
    $destroy() {
      this.#t.$destroy();
    }
  },
  Gr;
function Kr(e, t, n, r) {
  let i = n[e]?.type;
  if (((t = i === 'Boolean' && typeof t != 'boolean' ? t != null : t), !r || !n[e])) return t;
  if (r === 'toAttribute')
    switch (i) {
      case 'Object':
      case 'Array':
        return t == null ? null : JSON.stringify(t);
      case 'Boolean':
        return t ? '' : null;
      case 'Number':
        return t ?? null;
      default:
        return t;
    }
  else
    switch (i) {
      case 'Object':
      case 'Array':
        return t && JSON.parse(t);
      case 'Boolean':
      default:
        return t;
      case 'Number':
        return t == null ? t : +t;
    }
}
function qr(e, t, n, r, i, a) {
  let o = class extends Gr {
    constructor() {
      (super(e, n, i), (this.$$p_d = t));
    }
    static get observedAttributes() {
      return x(t).map((e) => (t[e].attribute || e).toLowerCase());
    }
  };
  return (
    x(t).forEach((e) => {
      S(o.prototype, e, {
        get() {
          return this.$$c && e in this.$$c ? this.$$c[e] : this.$$d[e];
        },
        set(n) {
          ((n = Kr(e, n, t)), (this.$$d[e] = n));
          var r = this.$$c;
          r && (C(r, e)?.get ? (r[e] = n) : r.$set({ [e]: n }));
        }
      });
    }),
    r.forEach((e) => {
      S(o.prototype, e, {
        get() {
          return this.$$c?.[e];
        }
      });
    }),
    a && (o = a(o)),
    (e.element = o),
    o
  );
}
var B;
(typeof HTMLElement == 'function' &&
  (Gr = class extends HTMLElement {
    $$ctor;
    $$s;
    $$c;
    $$cn = !1;
    $$d = {};
    $$r = !1;
    $$p_d = {};
    $$l = {};
    $$l_u = /* @__PURE__ */ new Map();
    $$me;
    $$shadowRoot = null;
    constructor(e, t, n) {
      (super(), (this.$$ctor = e), (this.$$s = t), n && (this.$$shadowRoot = this.attachShadow(n)));
    }
    addEventListener(e, t, n) {
      if (((this.$$l[e] = this.$$l[e] || []), this.$$l[e].push(t), this.$$c)) {
        let n = this.$$c.$on(e, t);
        this.$$l_u.set(t, n);
      }
      super.addEventListener(e, t, n);
    }
    removeEventListener(e, t, n) {
      if ((super.removeEventListener(e, t, n), this.$$c)) {
        let e = this.$$l_u.get(t);
        e && (e(), this.$$l_u.delete(t));
      }
    }
    async connectedCallback() {
      if (((this.$$cn = !0), !this.$$c)) {
        if ((await Promise.resolve(), !this.$$cn || this.$$c)) return;
        function t(e) {
          return (t) => {
            let n = xn('slot');
            (e !== 'default' && (n.name = e), Cr(t, n));
          };
        }
        let n = {},
          r = (function (e) {
            let t = {};
            return (
              e.childNodes.forEach((e) => {
                t[e.slot || 'default'] = !0;
              }),
              t
            );
          })(this);
        for (let e of this.$$s)
          e in r &&
            (e !== 'default' || this.$$d.children ? (n[e] = t(e)) : ((this.$$d.children = t(e)), (n.default = !0)));
        for (let e of this.attributes) {
          let t = this.$$g_p(e.name);
          t in this.$$d || (this.$$d[t] = Kr(t, e.value, this.$$p_d, 'toProp'));
        }
        for (let e in this.$$p_d) e in this.$$d || this[e] === void 0 || ((this.$$d[e] = this[e]), delete this[e]);
        ((this.$$c =
          ((e = {
            component: this.$$ctor,
            target: this.$$shadowRoot || this,
            props: {
              ...this.$$d,
              $$slots: n,
              $$host: this
            }
          }),
          new Wr(e))),
          (this.$$me = (function (e) {
            O.ensure();
            let t = Tn(524352, e);
            return () => {
              In(t);
            };
          })(() => {
            jn(() => {
              this.$$r = !0;
              for (let e of x(this.$$c)) {
                if (!this.$$p_d[e]?.reflect) continue;
                this.$$d[e] = this.$$c[e];
                let t = Kr(e, this.$$d[e], this.$$p_d, 'toAttribute');
                t == null
                  ? this.removeAttribute(this.$$p_d[e].attribute || e)
                  : this.setAttribute(this.$$p_d[e].attribute || e, t);
              }
              this.$$r = !1;
            });
          })));
        for (let e in this.$$l)
          for (let t of this.$$l[e]) {
            let n = this.$$c.$on(e, t);
            this.$$l_u.set(t, n);
          }
        this.$$l = {};
      }
      var e;
    }
    attributeChangedCallback(e, t, n) {
      this.$$r ||
        ((e = this.$$g_p(e)), (this.$$d[e] = Kr(e, n, this.$$p_d, 'toProp')), this.$$c?.$set({ [e]: this.$$d[e] }));
    }
    disconnectedCallback() {
      ((this.$$cn = !1),
        Promise.resolve().then(() => {
          !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), (this.$$c = void 0));
        }));
    }
    $$g_p(e) {
      return (
        x(this.$$p_d).find(
          (t) => this.$$p_d[t].attribute === e || (!this.$$p_d[t].attribute && t.toLowerCase() === e)
        ) || e
      );
    }
  }),
  (function (e) {
    ((e.CUSTOM_MESSAGE = 'custom'),
      (e.GET_CONTEXT = 'luigi.get-context'),
      (e.SEND_CONTEXT_HANDSHAKE = 'luigi.init'),
      (e.CONTEXT_RECEIVED = 'luigi.init.ok'),
      (e.NAVIGATION_REQUEST = 'luigi.navigation.open'),
      (e.ALERT_REQUEST = 'luigi.ux.alert.show'),
      (e.ALERT_CLOSED = 'luigi.ux.alert.hide'),
      (e.INITIALIZED = 'luigi.init.ok'),
      (e.ADD_SEARCH_PARAMS_REQUEST = 'luigi.addSearchParams'),
      (e.ADD_NODE_PARAMS_REQUEST = 'luigi.addNodeParams'),
      (e.SHOW_CONFIRMATION_MODAL_REQUEST = 'luigi.ux.confirmationModal.show'),
      (e.CONFIRMATION_MODAL_CLOSED = 'luigi.ux.confirmationModal.hide'),
      (e.SHOW_LOADING_INDICATOR_REQUEST = 'luigi.show-loading-indicator'),
      (e.HIDE_LOADING_INDICATOR_REQUEST = 'luigi.hide-loading-indicator'),
      (e.SET_CURRENT_LOCALE_REQUEST = 'luigi.ux.set-current-locale'),
      (e.LOCAL_STORAGE_SET_REQUEST = 'storage'),
      (e.RUNTIME_ERROR_HANDLING_REQUEST = 'luigi-runtime-error-handling'),
      (e.SET_ANCHOR_LINK_REQUEST = 'luigi.setAnchor'),
      (e.SET_THIRD_PARTY_COOKIES_REQUEST = 'luigi.third-party-cookie'),
      (e.BACK_NAVIGATION_REQUEST = 'luigi.navigation.back'),
      (e.GET_CURRENT_ROUTE_REQUEST = 'luigi.navigation.currentRoute'),
      (e.SEND_CURRENT_ROUTE_ANSWER = 'luigi.navigation.currentRoute.answer'),
      (e.SEND_CONTEXT_OBJECT = 'luigi.navigate'),
      (e.NAVIGATION_COMPLETED_REPORT = 'luigi.navigate.ok'),
      (e.CLOSE_MODAL_ANSWER = 'luigi.navigation.modal.close'),
      (e.UPDATE_MODAL_PATH_DATA_REQUEST = 'luigi.navigation.updateModalDataPath'),
      (e.UPDATE_MODAL_SETTINGS = 'luigi.navigation.updateModalSettings'),
      (e.CHECK_PATH_EXISTS_REQUEST = 'luigi.navigation.pathExists'),
      (e.SEND_PATH_EXISTS_ANSWER = 'luigi.navigation.pathExists.answer'),
      (e.SET_DIRTY_STATUS_REQUEST = 'luigi.set-page-dirty'),
      (e.AUTH_SET_TOKEN = 'luigi.auth.tokenIssued'),
      (e.ADD_BACKDROP_REQUEST = 'luigi.add-backdrop'),
      (e.REMOVE_BACKDROP_REQUEST = 'luigi.remove-backdrop'),
      (e.SET_VIEW_GROUP_DATA_REQUEST = 'luigi.setVGData'),
      (e.CLOSE_CURRENT_MODAL_REQUEST = 'luigi.close-modal'));
  })((B ||= {})));
var Jr = class extends Event {
    constructor(e, t, n, r) {
      (super(e), (this.detail = t), (this.payload = n || t || {}), (this.callbackFn = r));
    }
    callback(e) {
      this.callbackFn && this.callbackFn(e);
    }
  },
  V = {
    ADD_BACKDROP_REQUEST: 'add-backdrop-request',
    ADD_NODE_PARAMS_REQUEST: 'add-node-params-request',
    ADD_SEARCH_PARAMS_REQUEST: 'add-search-params-request',
    ALERT_CLOSED: 'close-alert-request',
    ALERT_REQUEST: 'show-alert-request',
    BACK_NAVIGATION_REQUEST: 'navigate-back-request',
    CHECK_PATH_EXISTS_REQUEST: 'check-path-exists-request',
    CLOSE_CURRENT_MODAL_REQUEST: 'close-current-modal-request',
    CLOSE_USER_SETTINGS_REQUEST: 'close-user-settings-request',
    COLLAPSE_LEFT_NAV_REQUEST: 'collapse-leftnav-request',
    CUSTOM_MESSAGE: 'custom-message',
    GET_CONTEXT_REQUEST: 'get-context-request',
    GET_CURRENT_ROUTE_REQUEST: 'get-current-route-request',
    GO_BACK_REQUEST: 'go-back-request',
    HAS_BACK_REQUEST: 'has-back-request',
    HIDE_LOADING_INDICATOR_REQUEST: 'hide-loading-indicator-request',
    INITIALIZED: 'initialized',
    LOCAL_STORAGE_SET_REQUEST: 'set-storage-request',
    NAVIGATION_COMPLETED_REPORT: 'report-navigation-completed-request',
    NAVIGATION_REQUEST: 'navigation-request',
    OPEN_USER_SETTINGS_REQUEST: 'open-user-settings-request',
    PATH_EXISTS_REQUEST: 'path-exists-request',
    REMOVE_BACKDROP_REQUEST: 'remove-backdrop-request',
    RUNTIME_ERROR_HANDLING_REQUEST: 'runtime-error-handling-request',
    SET_ANCHOR_LINK_REQUEST: 'set-anchor-request',
    SET_CURRENT_LOCALE_REQUEST: 'set-current-locale-request',
    SET_DIRTY_STATUS_REQUEST: 'set-dirty-status-request',
    SET_DOCUMENT_TITLE_REQUEST: 'set-document-title-request',
    SET_THIRD_PARTY_COOKIES_REQUEST: 'set-third-party-cookies-request',
    SET_VIEW_GROUP_DATA_REQUEST: 'set-viewgroup-data-request',
    SHOW_CONFIRMATION_MODAL_REQUEST: 'show-confirmation-modal-request',
    SHOW_LOADING_INDICATOR_REQUEST: 'show-loading-indicator-request',
    UPDATE_MODAL_PATH_DATA_REQUEST: 'update-modal-path-data-request',
    UPDATE_MODAL_SETTINGS_REQUEST: 'update-modal-settings-request',
    UPDATE_TOP_NAVIGATION_REQUEST: 'update-top-navigation-request'
  },
  Yr = class {
    isVisible(e) {
      return getComputedStyle(e).display !== 'none' && !(!e.offsetWidth && !e.offsetHeight);
    }
    sendCustomMessageToIframe(e, t, n) {
      let r = n || 'custom';
      if (e?.iframe?.contentWindow) {
        let n = new URL(e.iframe.src);
        r === 'custom'
          ? e.iframe.contentWindow.postMessage(
              {
                msg: r,
                data: t
              },
              n.origin
            )
          : e.iframe.contentWindow.postMessage(
              {
                msg: r,
                ...t
              },
              n.origin
            );
      } else console.error('Message target could not be resolved');
    }
    dispatchWithPayload(e, t, n, r, i) {
      this.dispatch(e, t, n, i, r);
    }
    dispatch(e, t, n, r, i) {
      let a = new Jr(e, n, i, r);
      t.dispatchEvent(a);
    }
    getTargetContainer(e) {
      let t;
      return (
        globalThis.__luigi_container_manager.container.forEach((n) => {
          n.iframeHandle?.iframe && n.iframeHandle.iframe.contentWindow === e.source && (t = n);
        }),
        t
      );
    }
    getContainerManager() {
      return (
        globalThis.__luigi_container_manager ||
          ((globalThis.__luigi_container_manager = {
            container: [],
            messageListener: (e) => {
              let t = this.getTargetContainer(e),
                n = t?.iframeHandle?.iframe?.contentWindow;
              if (n && n === e.source)
                switch (e.data.msg) {
                  case B.CUSTOM_MESSAGE:
                    {
                      let n = e.data.data,
                        r = n.id;
                      (delete n.id,
                        this.dispatch(V.CUSTOM_MESSAGE, t, {
                          id: r,
                          _metaData: {},
                          data: n
                        }));
                    }
                    break;
                  case B.GET_CONTEXT:
                    n.postMessage(
                      {
                        msg: B.SEND_CONTEXT_HANDSHAKE,
                        context: t.context || {},
                        internal: {
                          thirdPartyCookieCheck: { disabled: t.skipCookieCheck === 'true' },
                          currentTheme: t.theme,
                          currentLocale: t.locale,
                          activeFeatureToggleList: t.activeFeatureToggleList || [],
                          cssVariables: t.cssVariables || {},
                          anchor: t.anchor || '',
                          userSettings: t.userSettings || null,
                          drawer: t.drawer || !1,
                          modal: t.modal || !1,
                          viewStackSize: t.viewStackSize || 0,
                          isNavigateBack: t.isNavigateBack || !1,
                          clientPermissions: t.clientPermissions || {}
                        },
                        authData: t.authData || {},
                        nodeParams: t.nodeParams || {},
                        searchParams: t.searchParams || {},
                        pathParams: t.pathParams || {}
                      },
                      e.origin
                    );
                    break;
                  case B.NAVIGATION_REQUEST:
                    this.dispatch(V.NAVIGATION_REQUEST, t, e.data.params, (t) => {
                      n.postMessage(
                        {
                          msg: B.CLOSE_MODAL_ANSWER,
                          data: t
                        },
                        e.origin
                      );
                    });
                    break;
                  case B.ALERT_REQUEST:
                    this.dispatchWithPayload(V.ALERT_REQUEST, t, e, e.data?.data?.settings, (n) => {
                      t.notifyAlertClosed(e.data?.data?.settings?.id, n);
                    });
                    break;
                  case B.INITIALIZED:
                    this.dispatch(V.INITIALIZED, t, e.data?.params || {});
                    break;
                  case B.ADD_SEARCH_PARAMS_REQUEST:
                    this.dispatch(V.ADD_SEARCH_PARAMS_REQUEST, t, {
                      data: e.data.data,
                      keepBrowserHistory: e.data.keepBrowserHistory
                    });
                    break;
                  case B.ADD_NODE_PARAMS_REQUEST:
                    this.dispatch(V.ADD_NODE_PARAMS_REQUEST, t, {
                      data: e.data.data,
                      keepBrowserHistory: e.data.keepBrowserHistory
                    });
                    break;
                  case B.SHOW_CONFIRMATION_MODAL_REQUEST:
                    this.dispatchWithPayload(
                      V.SHOW_CONFIRMATION_MODAL_REQUEST,
                      t,
                      e.data.data,
                      e.data.data?.settings,
                      (e) => {
                        t.notifyConfirmationModalClosed(e);
                      }
                    );
                    break;
                  case B.SHOW_LOADING_INDICATOR_REQUEST:
                    this.dispatch(V.SHOW_LOADING_INDICATOR_REQUEST, t, e);
                    break;
                  case B.HIDE_LOADING_INDICATOR_REQUEST:
                    this.dispatch(V.HIDE_LOADING_INDICATOR_REQUEST, t, e);
                    break;
                  case B.SET_CURRENT_LOCALE_REQUEST:
                    this.dispatchWithPayload(V.SET_CURRENT_LOCALE_REQUEST, t, e, e.data.data);
                    break;
                  case B.LOCAL_STORAGE_SET_REQUEST:
                    this.dispatchWithPayload(V.LOCAL_STORAGE_SET_REQUEST, t, e, e.data.data?.params);
                    break;
                  case B.RUNTIME_ERROR_HANDLING_REQUEST:
                    this.dispatch(V.RUNTIME_ERROR_HANDLING_REQUEST, t, e);
                    break;
                  case B.SET_ANCHOR_LINK_REQUEST:
                    this.dispatchWithPayload(V.SET_ANCHOR_LINK_REQUEST, t, e, e.data.anchor);
                    break;
                  case B.SET_THIRD_PARTY_COOKIES_REQUEST:
                    this.dispatch(V.SET_THIRD_PARTY_COOKIES_REQUEST, t, e);
                    break;
                  case B.BACK_NAVIGATION_REQUEST:
                    {
                      let n = e.data?.goBackContext || {};
                      if (typeof n == 'string')
                        try {
                          n = JSON.parse(n);
                        } catch (e) {
                          console.warn(e);
                        }
                      (this.dispatch(V.GO_BACK_REQUEST, t, n), this.dispatch(V.BACK_NAVIGATION_REQUEST, t, e));
                    }
                    break;
                  case B.GET_CURRENT_ROUTE_REQUEST:
                    this.dispatchWithPayload(V.GET_CURRENT_ROUTE_REQUEST, t, e, e.data.data, (t) => {
                      n.postMessage(
                        {
                          msg: B.SEND_CURRENT_ROUTE_ANSWER,
                          data: {
                            correlationId: e.data?.data?.id,
                            route: t
                          }
                        },
                        e.origin
                      );
                    });
                    break;
                  case B.NAVIGATION_COMPLETED_REPORT:
                    this.dispatch(V.NAVIGATION_COMPLETED_REPORT, t, e);
                    break;
                  case B.UPDATE_MODAL_PATH_DATA_REQUEST:
                    this.dispatchWithPayload(V.UPDATE_MODAL_PATH_DATA_REQUEST, t, e, e.data.params);
                    break;
                  case B.UPDATE_MODAL_SETTINGS:
                    this.dispatchWithPayload(V.UPDATE_MODAL_SETTINGS_REQUEST, t, e, {
                      addHistoryEntry: e.data.addHistoryEntry,
                      updatedModalSettings: e.data.updatedModalSettings
                    });
                    break;
                  case B.CHECK_PATH_EXISTS_REQUEST:
                    this.dispatchWithPayload(V.CHECK_PATH_EXISTS_REQUEST, t, e, e.data.data, (t) => {
                      n.postMessage(
                        {
                          msg: B.SEND_PATH_EXISTS_ANSWER,
                          data: {
                            correlationId: e.data?.data?.id,
                            pathExists: t
                          }
                        },
                        e.origin
                      );
                    });
                    break;
                  case B.SET_DIRTY_STATUS_REQUEST:
                    this.dispatchWithPayload(V.SET_DIRTY_STATUS_REQUEST, t, e, { dirty: e.data.dirty });
                    break;
                  case B.SET_VIEW_GROUP_DATA_REQUEST:
                    this.dispatch(V.SET_VIEW_GROUP_DATA_REQUEST, t, e.data.data);
                    break;
                  case B.ADD_BACKDROP_REQUEST:
                    this.dispatch(V.ADD_BACKDROP_REQUEST, t, e);
                    break;
                  case B.REMOVE_BACKDROP_REQUEST:
                    this.dispatch(V.REMOVE_BACKDROP_REQUEST, t, e);
                    break;
                  case B.CLOSE_CURRENT_MODAL_REQUEST:
                    this.dispatch(V.CLOSE_CURRENT_MODAL_REQUEST, t, e);
                }
            }
          }),
          window.addEventListener('message', globalThis.__luigi_container_manager.messageListener)),
        globalThis.__luigi_container_manager
      );
    }
    registerContainer(e) {
      this.getContainerManager().container.push(e);
    }
  },
  Xr = new Yr(),
  Zr = new (class {
    constructor() {
      ((this.updateContext = (e, t, n, r, i, a) => {
        if (n) {
          let o = t || {};
          Xr.sendCustomMessageToIframe(
            n,
            {
              context: e,
              nodeParams: r || {},
              pathParams: i || {},
              searchParams: a || {},
              internal: o,
              withoutSync: o.withoutSync ?? !0
            },
            B.SEND_CONTEXT_OBJECT
          );
        } else console.warn('Attempting to update context on inexisting iframe');
      }),
        (this.updateViewUrl = (e, t, n, r) => {
          if (r) {
            let i = n || {};
            Xr.sendCustomMessageToIframe(
              r,
              {
                context: t,
                internal: i,
                withoutSync: !1,
                viewUrl: e
              },
              B.SEND_CONTEXT_OBJECT
            );
          } else console.warn('Attempting to update route on inexisting iframe');
        }),
        (this.updateAuthData = (e, t) => {
          e && t
            ? Xr.sendCustomMessageToIframe(e, { authData: t }, B.AUTH_SET_TOKEN)
            : console.warn('Attempting to update auth data on inexisting iframe or authData');
        }),
        (this.sendCustomMessage = (e, t, n, r, i) => {
          if (n && t._luigi_mfe_webcomponent) Xr.dispatch(e, t._luigi_mfe_webcomponent, i);
          else {
            let t = { ...i };
            (t.id && console.warn('Property "id" is reserved and can not be used in custom message data'),
              (t.id = e),
              Xr.sendCustomMessageToIframe(r, t));
          }
        }),
        (this.notifyConfirmationModalClosed = (e, t) => {
          let n = { data: { confirmed: e } };
          Xr.sendCustomMessageToIframe(t, n, B.CONFIRMATION_MODAL_CLOSED);
        }));
    }
    notifyAlertClosed(e, t, n) {
      let r = t
        ? {
            id: e,
            dismissKey: t
          }
        : { id: e };
      Xr.sendCustomMessageToIframe(n, r, B.ALERT_CLOSED);
    }
  })(),
  Qr = class {
    constructor(e) {
      e ? ((this.rendererObject = e), (this.config = e.config || {})) : (this.config = {});
    }
    createCompoundContainer() {
      return document.createElement('div');
    }
    createCompoundItemContainer(e) {
      return document.createElement('div');
    }
    attachCompoundItem(e, t) {
      e.appendChild(t);
    }
  },
  $r = class extends Qr {
    constructor(e) {
      (super(e || { use: {} }),
        e &&
          e.use &&
          e.use.extends &&
          (this.superRenderer = ti({
            use: e.use.extends,
            config: e.config
          })));
    }
    createCompoundContainer() {
      return this.rendererObject.use.createCompoundContainer
        ? this.rendererObject.use.createCompoundContainer(this.config, this.superRenderer)
        : this.superRenderer
          ? this.superRenderer.createCompoundContainer()
          : super.createCompoundContainer();
    }
    createCompoundItemContainer(e) {
      return this.rendererObject.use.createCompoundItemContainer
        ? this.rendererObject.use.createCompoundItemContainer(e, this.config, this.superRenderer)
        : this.superRenderer
          ? this.superRenderer.createCompoundItemContainer(e)
          : super.createCompoundItemContainer(e);
    }
    attachCompoundItem(e, t) {
      this.rendererObject.use.attachCompoundItem
        ? this.rendererObject.use.attachCompoundItem(e, t, this.superRenderer)
        : this.superRenderer
          ? this.superRenderer.attachCompoundItem(e, t)
          : super.attachCompoundItem(e, t);
    }
  },
  ei = class extends Qr {
    createCompoundContainer() {
      let e = '__lui_compound_' + /* @__PURE__ */ new Date().getTime(),
        t = document.createElement('div');
      t.classList.add(e);
      let n = '';
      return (
        this.config.layouts &&
          this.config.layouts.forEach((t) => {
            if (t.minWidth || t.maxWidth) {
              let r = '@media only screen ';
              (t.minWidth != null && (r += `and (min-width: ${t.minWidth}px) `),
                t.maxWidth != null && (r += `and (max-width: ${t.maxWidth}px) `),
                (r += `{\n            .${e} {\n              grid-template-columns: ${t.columns || 'auto'};\n              grid-template-rows: ${t.rows || 'auto'};\n              grid-gap: ${t.gap || '0'};\n            }\n          }\n          `),
                (n += r));
            }
          }),
        (t.innerHTML = `\n        <style scoped>\n          .${e} {\n            display: grid;\n            grid-template-columns: ${this.config.columns || 'auto'};\n            grid-template-rows: ${this.config.rows || 'auto'};\n            grid-gap: ${this.config.gap || '0'};\n            min-height: ${this.config.minHeight || 'auto'};\n          }\n          ${n}\n        </style>\n    `),
        t
      );
    }
    createCompoundItemContainer(e) {
      let t = e || {},
        n = document.createElement('div');
      return (
        n.setAttribute('style', `grid-row: ${t.row || 'auto'}; grid-column: ${t.column || 'auto'}`),
        n.classList.add('lui-compoundItemCnt'),
        n
      );
    }
  },
  ti = (e) => {
    let t = e.use;
    return t
      ? t === 'grid'
        ? new ei(e)
        : t.createCompoundContainer || t.createCompoundItemContainer || t.attachCompoundItem
          ? new $r(e)
          : new Qr(e)
      : new Qr(e);
  },
  ni = (e, t, n, r) => {
    t?.eventListeners &&
      t.eventListeners.forEach((t) => {
        let i = t.source + '.' + t.name,
          a = e[i],
          o = {
            wcElementId: n,
            wcElement: r,
            action: t.action,
            converter: t.dataConverter
          };
        a ? a.push(o) : (e[i] = [o]);
      });
  };
function ri(e) {
  return String(e)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&sol;', '/');
}
var ii = class {
    constructor() {
      ((this.alertResolvers = {}), (this.alertIndex = 0), (this.containerService = new Yr()));
    }
    dynamicImport(e) {
      return Object.freeze(
        import(
          /* webpackIgnore: true */
          e
        )
      );
    }
    processViewUrl(e, t) {
      return e;
    }
    attachWC(e, t, n, r, i, a, o) {
      if (n && n.contains(t)) {
        let s = document.createElement(e);
        (a && s.setAttribute('nodeId', a),
          s.setAttribute('lui_web_component', 'true'),
          this.initWC(s, e, n, i, r, a, o),
          n.replaceChild(s, t),
          n._luigi_node && (n._luigi_mfe_webcomponent = s),
          n.dispatchEvent(new Event('wc_ready')));
      }
    }
    dispatchLuigiEvent(e, t, n) {
      this.containerService.dispatch(e, this.thisComponent, t, n);
    }
    createClientAPI(e, t, n, r, i) {
      return {
        linkManager: () => {
          let e = null,
            t = !1,
            n = !1,
            r = !1,
            i = {},
            a = {
              navigate: (a, o = {}, s) => {
                let c = {
                  fromContext: e,
                  fromClosestContext: t,
                  fromVirtualTreeRoot: n,
                  fromParent: r,
                  nodeParams: i,
                  ...o
                };
                this.dispatchLuigiEvent(
                  V.NAVIGATION_REQUEST,
                  {
                    link: a,
                    ...c
                  },
                  s
                );
              },
              navigateToIntent: (e, t = {}) => {
                let n = '#?intent=';
                if (((n += e), t && Object.keys(t)?.length)) {
                  let e = Object.entries(t);
                  if (e.length > 0) {
                    n += '?';
                    for (let [t, r] of e) n += t + '=' + r + '&';
                    n = n.slice(0, -1);
                  }
                }
                a.navigate(n);
              },
              fromClosestContext: () => ((t = !0), a),
              fromContext: (t) => ((e = t), a),
              fromVirtualTreeRoot: () => ((n = !0), a),
              fromParent: () => ((r = !0), a),
              getCurrentRoute: () => {
                let a = {
                  fromContext: e,
                  fromClosestContext: t,
                  fromVirtualTreeRoot: n,
                  fromParent: r,
                  nodeParams: i
                };
                return new Promise((e) => {
                  this.containerService.dispatch(V.GET_CURRENT_ROUTE_REQUEST, this.thisComponent, { ...a }, (t) => {
                    e(t);
                  });
                });
              },
              withParams: (e) => ((i = e), a),
              updateModalPathInternalNavigation: (a, o = {}, s = !1) => {
                if (!a)
                  return void console.warn(
                    'Updating path of the modal upon internal navigation prevented. No path specified.'
                  );
                let c = {
                  fromClosestContext: t,
                  fromContext: e,
                  fromParent: r,
                  fromVirtualTreeRoot: n,
                  nodeParams: i
                };
                this.dispatchLuigiEvent(
                  V.UPDATE_MODAL_PATH_DATA_REQUEST,
                  Object.assign(c, {
                    history: s,
                    link: a,
                    modal: o
                  })
                );
              },
              updateTopNavigation: () => {
                this.dispatchLuigiEvent(V.UPDATE_TOP_NAVIGATION_REQUEST, {});
              },
              pathExists: (a) => {
                let o = {
                  fromContext: e,
                  fromClosestContext: t,
                  fromVirtualTreeRoot: n,
                  fromParent: r,
                  nodeParams: i
                };
                return new Promise((e, t) => {
                  (this.containerService.dispatch(
                    V.CHECK_PATH_EXISTS_REQUEST,
                    this.thisComponent,
                    {
                      ...o,
                      link: a
                    },
                    (n) => {
                      n ? e(!0) : t(!1);
                    }
                  ),
                    this.containerService.dispatch(
                      V.PATH_EXISTS_REQUEST,
                      this.thisComponent,
                      {
                        ...o,
                        link: a
                      },
                      (n) => {
                        n ? e(!0) : t(!1);
                      }
                    ));
                });
              },
              openAsDrawer: (e, t = {}) => {
                a.navigate(e, { drawer: t });
              },
              openAsModal: (e, t = {}, n) =>
                new Promise((r) => {
                  a.navigate(e, { modal: t }, (e) => {
                    (r({ goBackValue: e }), n && typeof n == 'function' && n(e));
                  });
                }),
              openAsSplitView: (e, t = {}) => {
                a.navigate(e, { splitView: t });
              },
              goBack: (e) => {
                this.dispatchLuigiEvent(V.GO_BACK_REQUEST, e);
              },
              hasBack: () => !1,
              updateModalSettings: (e = {}, t = !1) => {
                this.dispatchLuigiEvent(V.UPDATE_MODAL_SETTINGS_REQUEST, {
                  updatedModalSettings: e,
                  addHistoryEntry: t
                });
              }
            };
          return a;
        },
        uxManager: () => ({
          showAlert: (e) => (
            (e.id = this.alertIndex++),
            new Promise((t) => {
              ((this.alertResolvers[e.id] = t),
                this.dispatchLuigiEvent(V.ALERT_REQUEST, e, (t) => {
                  this.resolveAlert(e.id, t);
                }));
            })
          ),
          showConfirmationModal: (e) =>
            new Promise((t, n) => {
              ((this.modalResolver = {
                resolve: t,
                reject: n
              }),
                this.containerService.dispatch(V.SHOW_CONFIRMATION_MODAL_REQUEST, this.thisComponent, e, (e) => {
                  e ? t() : n();
                }));
            }),
          getCurrentTheme: () => this.thisComponent.theme,
          closeUserSettings: () => {
            this.dispatchLuigiEvent(V.CLOSE_USER_SETTINGS_REQUEST, this.thisComponent.userSettings);
          },
          openUserSettings: () => {
            this.dispatchLuigiEvent(V.OPEN_USER_SETTINGS_REQUEST, this.thisComponent.userSettings);
          },
          collapseLeftSideNav: (e) => {
            this.dispatchLuigiEvent(V.COLLAPSE_LEFT_NAV_REQUEST, { state: e });
          },
          getDirtyStatus: () => this.thisComponent.dirtyStatus || !1,
          getDocumentTitle: () => this.thisComponent.documentTitle,
          setDocumentTitle: (e) => {
            this.dispatchLuigiEvent(V.SET_DOCUMENT_TITLE_REQUEST, e);
          },
          setDirtyStatus: (e) => {
            this.dispatchLuigiEvent(V.SET_DIRTY_STATUS_REQUEST, { dirty: e });
          },
          setCurrentLocale: (e) => {
            e && this.dispatchLuigiEvent(V.SET_CURRENT_LOCALE_REQUEST, { currentLocale: e });
          },
          removeBackdrop: () => {
            this.dispatchLuigiEvent(V.REMOVE_BACKDROP_REQUEST, {});
          },
          addBackdrop: () => {
            this.dispatchLuigiEvent(V.ADD_BACKDROP_REQUEST, {});
          },
          showLoadingIndicator: () => {
            this.dispatchLuigiEvent(V.SHOW_LOADING_INDICATOR_REQUEST, {});
          },
          hideLoadingIndicator: () => {
            this.dispatchLuigiEvent(V.HIDE_LOADING_INDICATOR_REQUEST, {});
          },
          hideAppLoadingIndicator: () => {
            this.dispatchLuigiEvent(V.HIDE_LOADING_INDICATOR_REQUEST, {});
          },
          closeCurrentModal: () => {
            this.dispatchLuigiEvent(V.CLOSE_CURRENT_MODAL_REQUEST, {});
          }
        }),
        getCurrentLocale: () => this.thisComponent.locale,
        getActiveFeatureToggles: () => this.thisComponent.activeFeatureToggleList || [],
        publishEvent: (i) => {
          e && e.eventBus && e.eventBus.onPublishEvent(i, t, n);
          let a = {
            id: i.type,
            _metaData: {
              nodeId: t,
              wc_id: n,
              src: r
            },
            data: i.detail
          };
          this.dispatchLuigiEvent(V.CUSTOM_MESSAGE, a);
        },
        luigiClientInit: () => {
          this.dispatchLuigiEvent(V.INITIALIZED, {});
        },
        addNodeParams: (e, t) => {
          i ||
            this.dispatchLuigiEvent(V.ADD_NODE_PARAMS_REQUEST, {
              params: e,
              data: e,
              keepBrowserHistory: t
            });
        },
        getNodeParams: (e) => {
          return i
            ? {}
            : e
              ? ((t = this.thisComponent.nodeParams),
                Object.entries(t).reduce((e, t) => ((e[ri(t[0])] = ri(t[1])), e), {}))
              : this.thisComponent.nodeParams || {};
          var t;
        },
        setAnchor: (e) => {
          i || this.dispatchLuigiEvent(V.SET_ANCHOR_LINK_REQUEST, e);
        },
        getAnchor: () => this.thisComponent.anchor || '',
        getCoreSearchParams: () => this.thisComponent.searchParams || {},
        getPathParams: () => this.thisComponent.pathParams || {},
        getClientPermissions: () => this.thisComponent.clientPermissions || {},
        addCoreSearchParams: (e = {}, t = !0, n = !1) => {
          this.dispatchLuigiEvent(V.ADD_SEARCH_PARAMS_REQUEST, {
            data: e,
            keepBrowserHistory: t,
            preventLuigiConfigUpdate: n
          });
        },
        getUserSettings: () => this.thisComponent.userSettings || {},
        setViewGroupData: (e) => {
          this.dispatchLuigiEvent(V.SET_VIEW_GROUP_DATA_REQUEST, e);
        }
      };
    }
    initWC(e, t, n, r, i, a, o) {
      let s = this.createClientAPI(n, a, t, e, o);
      if (e.__postProcess) {
        let t =
          new URL(document.baseURI).origin === new URL(r, document.baseURI).origin
            ? new URL('./', new URL(r, document.baseURI))
            : new URL('./', r);
        e.__postProcess(i, s, t.origin + t.pathname);
      } else ((e.context = i), (e.LuigiClient = s));
      let c = this.thisComponent.webcomponentCreationInterceptor;
      if (c && typeof c == 'function')
        try {
          let t = !!this.thisComponent._luigiMicroFrontendType && this.thisComponent._luigiMicroFrontendType !== 'main';
          c(e, this.thisComponent.currentNode, i, a, t);
        } catch (e) {
          console.error('Error applying web component creation interceptor: ', e);
        }
    }
    generateWCId(e) {
      let t = '',
        n = new URL(e, encodeURI(location.href)).href;
      for (let e = 0; e < n.length; e++) t += n.charCodeAt(e).toString(16);
      return 'luigi-wc-' + t;
    }
    registerWCFromUrl(e, t) {
      let n = this.processViewUrl(e);
      return new Promise((e, r) => {
        this.checkWCUrl(n)
          ? this.dynamicImport(n)
              .then((n) => {
                try {
                  if (!window.customElements.get(t)) {
                    let e = n.default;
                    if (!HTMLElement.isPrototypeOf(e)) {
                      let t = Object.keys(n);
                      for (let r = 0; r < t.length && ((e = n[t[r]]), !HTMLElement.isPrototypeOf(e)); r++);
                    }
                    window.customElements.define(t, e);
                  }
                  e(1);
                } catch (e) {
                  r(e);
                }
              })
              .catch((e) => {
                r(e);
              })
          : r(`Error: View URL '${n}' not allowed to be included`);
      });
    }
    includeSelfRegisteredWCFromUrl(e, t, n) {
      if (this.checkWCUrl(t)) {
        (this.containerService.getContainerManager()._registerWebcomponent ||
          (this.containerService.getContainerManager()._registerWebcomponent = (e, t) => {
            window.customElements.define(this.generateWCId(e), t);
          }),
          window.Luigi ||
            ((window.Luigi = {}),
            window.Luigi._registerWebcomponent ||
              (window.Luigi._registerWebcomponent = (e, t) => {
                this.containerService.getContainerManager()._registerWebcomponent(e, t);
              })));
        let r = document.createElement('script');
        (r.setAttribute('src', t),
          e.webcomponent.type === 'module' && r.setAttribute('type', 'module'),
          r.setAttribute('defer', 'true'),
          r.addEventListener('load', () => {
            n();
          }),
          document.body.appendChild(r));
      } else console.warn(`View URL '${t}' not allowed to be included`);
    }
    checkWCUrl(e) {
      return !0;
    }
    renderWebComponent(e, t, n, r, i, a) {
      let o = this.processViewUrl(e, { context: n }),
        s = r?.webcomponent?.tagName || this.generateWCId(o),
        c = document.createElement('div');
      (t.appendChild(c),
        (t._luigi_node = r),
        window.customElements.get(s)
          ? this.attachWC(s, c, t, n, o, i, a)
          : window.luigiWCFn
            ? window.luigiWCFn(o, s, c, () => {
                this.attachWC(s, c, t, n, o, i, a);
              })
            : r?.webcomponent?.selfRegistered
              ? this.includeSelfRegisteredWCFromUrl(r, o, () => {
                  this.attachWC(s, c, t, n, o, i, a);
                })
              : this.registerWCFromUrl(o, s)
                  .then(() => {
                    this.attachWC(s, c, t, n, o, i, a);
                  })
                  .catch((e) => {
                    (console.warn('ERROR =>', e),
                      this.containerService.dispatch(V.RUNTIME_ERROR_HANDLING_REQUEST, this.thisComponent, e));
                  }));
    }
    createCompoundContainerAsync(e, t, n) {
      return new Promise((r, i) => {
        if (e.viewUrl)
          try {
            let i = n?.webcomponent?.tagName || this.generateWCId(e.viewUrl);
            n?.webcomponent?.selfRegistered
              ? this.includeSelfRegisteredWCFromUrl(n, e.viewUrl, () => {
                  let n = document.createElement(i);
                  (n.setAttribute('lui_web_component', 'true'), this.initWC(n, i, n, e.viewUrl, t, '_root'), r(n));
                })
              : this.registerWCFromUrl(e.viewUrl, i)
                  .then(() => {
                    let n = document.createElement(i);
                    (n.setAttribute('lui_web_component', 'true'), this.initWC(n, i, n, e.viewUrl, t, '_root'), r(n));
                  })
                  .catch((e) => {
                    (console.warn('Error: ', e),
                      this.containerService.dispatch(V.RUNTIME_ERROR_HANDLING_REQUEST, this.thisComponent, e));
                  });
          } catch (e) {
            i(e);
          }
        else r(e.createCompoundContainer());
      });
    }
    renderWebComponentCompound(e, t, n) {
      let r;
      return (
        e.webcomponent && e.viewUrl
          ? ((r = new Qr()),
            (r.viewUrl = this.processViewUrl(e.viewUrl, { context: n })),
            (r.createCompoundItemContainer = (e) => {
              let t = document.createElement('div');
              return (e?.slot && t.setAttribute('slot', e.slot), t);
            }))
          : e.compound?.renderer && (r = ti(e.compound.renderer)),
        (r ||= new Qr()),
        new Promise((i) => {
          this.createCompoundContainerAsync(r, n, e)
            .then((a) => {
              ((t._luigi_mfe_webcomponent = a), (t._luigi_node = e));
              let o = {};
              ((a.eventBus = {
                listeners: o,
                onPublishEvent: (e, t, n) => {
                  let r = o[t + '.' + e.type] || [];
                  (r.push(...(o['*.' + e.type] || [])),
                    r.forEach((t) => {
                      let n = t.wcElement || a.querySelector('[nodeId=' + t.wcElementId + ']');
                      n
                        ? n.dispatchEvent(
                            new CustomEvent(t.action, { detail: t.converter ? t.converter(e.detail) : e.detail })
                          )
                        : console.debug('Could not find event target', t);
                    }));
                }
              }),
                e.compound?.children?.forEach((e, t) => {
                  let i = {
                      ...n,
                      ...e.context
                    },
                    s = r.createCompoundItemContainer(e.layoutConfig);
                  ((s.eventBus = a.eventBus), r.attachCompoundItem(a, s));
                  let c = e.id || 'gen_' + t;
                  (this.renderWebComponent(e.viewUrl, s, i, e, c, !0), ni(o, e, c));
                }),
                t.appendChild(a),
                ni(o, e.compound, '_root', a),
                i(a));
            })
            .catch((e) => {
              (console.warn('Error: ', e),
                this.containerService.dispatch(V.RUNTIME_ERROR_HANDLING_REQUEST, this.thisComponent, e));
            });
        })
      );
    }
    resolveAlert(e, t) {
      this.alertResolvers[e]
        ? (this.alertResolvers[e](t === void 0 || t), (this.alertResolvers[e] = void 0))
        : console.log('Promise is not in the list.');
    }
    notifyConfirmationModalClosed(e) {
      this.modalResolver
        ? (e ? this.modalResolver.resolve() : this.modalResolver.reject(), (this.modalResolver = void 0))
        : console.log('Modal promise is not listed.');
    }
  },
  ai = new (class {
    isFunction(e) {
      return e && {}.toString.call(e) === '[object Function]';
    }
    isObject(e) {
      return !(!e || typeof e != 'object' || Array.isArray(e));
    }
    checkWebcomponentValue(e) {
      return typeof e == 'string'
        ? JSON.parse(e)
        : typeof e == 'boolean' || typeof e == 'object'
          ? e
          : void console.warn('Webcomponent value has a wrong type.');
    }
    resolveContext(e) {
      return e ? (typeof e == 'string' ? JSON.parse(e) : e) : {};
    }
  })(),
  oi = Sr(
    '<style>main.lui-isolated,\n        .lui-isolated iframe {\n          width: 100%;\n          height: 100%;\n          border: none;\n        }\n\n        main.lui-isolated {\n          line-height: 0;\n        }</style>'
  ),
  si = Sr('<main><!></main>');
function ci(e, t) {
  nt(t, !1);
  let n = z(t, 'activeFeatureToggleList', 12),
    r = z(t, 'allowRules', 12),
    i = z(t, 'anchor', 12),
    a = z(t, 'authData', 12),
    o = z(t, 'clientPermissions', 12),
    s = z(t, 'context', 12),
    c = z(t, 'deferInit', 12),
    l = z(t, 'dirtyStatus', 12),
    u = z(t, 'documentTitle', 12),
    d = z(t, 'hasBack', 12),
    p = z(t, 'label', 12),
    m = z(t, 'locale', 12),
    h = z(t, 'noShadow', 12),
    g = z(t, 'nodeParams', 12),
    _ = z(t, 'pathParams', 12),
    v = z(t, 'sandboxRules', 12),
    y = z(t, 'searchParams', 12),
    b = z(t, 'skipCookieCheck', 12),
    x = z(t, 'skipInitCheck', 12),
    S = z(t, 'theme', 12),
    C = z(t, 'userSettings', 12),
    ee = z(t, 'viewurl', 12),
    te = z(t, 'webcomponent', 12),
    ne = { iframe: void 0 },
    re = nn(),
    ie = nn(!1),
    ae = nn(),
    oe = new ii(),
    se = () =>
      n() &&
      r() &&
      i() &&
      a() &&
      o() &&
      l() &&
      u() &&
      d() &&
      m() &&
      h() &&
      g() &&
      _() &&
      v() &&
      y() &&
      b() &&
      x() &&
      S() &&
      C(),
    ce = (e) => {
      if (!I(ie)) {
        ((e.sendCustomMessage = (t, n) => {
          Zr.sendCustomMessage(t, e.getNoShadow() ? e : I(re), !!te(), ne, n);
        }),
          (e.updateContext = (t, n) => {
            if ((s(t), te())) (e.getNoShadow() ? e : I(re))._luigi_mfe_webcomponent.context = t;
            else {
              let r = {
                ...(n || {}),
                activeFeatureToggleList: e.activeFeatureToggleList || [],
                currentLocale: e.locale,
                currentTheme: e.theme,
                userSettings: e.userSettings || null,
                cssVariables: e.cssVariables || {},
                anchor: e.anchor || '',
                drawer: e.drawer || !1,
                modal: e.modal || !1,
                viewStackSize: e.viewStackSize || 0,
                isNavigateBack: e.isNavigateBack || !1,
                clientPermissions: e.clientPermissions || {}
              };
              Zr.updateContext(t, r, ne, g(), _(), y());
            }
          }),
          (e.closeAlert = (t, n) => {
            e.notifyAlertClosed(t, n);
          }),
          (e.notifyAlertClosed = (t, n) => {
            e.isConnected && (te() ? oe.resolveAlert(t, n) : Zr.notifyAlertClosed(t, n, ne));
          }),
          (e.notifyConfirmationModalClosed = (t) => {
            e.isConnected && (te() ? oe.notifyConfirmationModalClosed(!!t) : Zr.notifyConfirmationModalClosed(!!t, ne));
          }),
          Xr.registerContainer(e),
          (oe.thisComponent = e));
        let t = ai.resolveContext(s());
        if (
          ((e.updateViewUrl = (e, t) => {
            e?.length && Zr.updateViewUrl(e, ai.resolveContext(s()), t, ne);
          }),
          te() && te() != 'false')
        ) {
          (e.getNoShadow()
            ? (e.innerHTML = '')
            : (rn(re, (I(re).innerHTML = '')), e.attachShadow({ mode: 'open' }).append(I(re))),
            x() ||
              (e.getNoShadow() ? e : I(re)).addEventListener('wc_ready', () => {
                (e.getNoShadow() ? e : I(re))._luigi_mfe_webcomponent?.deferLuigiClientWCInit ||
                  ((e.initialized = !0), oe.dispatchLuigiEvent(V.INITIALIZED, {}));
              }));
          let n = ai.checkWebcomponentValue(te());
          oe.renderWebComponent(ee(), e.getNoShadow() ? e : I(re), t, typeof n == 'object' ? { webcomponent: n } : {});
        } else e.getNoShadow() || ((e.innerHTML = ''), e.attachShadow({ mode: 'open' }).append(I(re)));
        (x() &&
          ((e.initialized = !0),
          setTimeout(() => {
            oe.dispatchLuigiEvent(V.INITIALIZED, {});
          })),
          (te() && te() !== 'false') ||
            setTimeout(() => {
              ue();
            }),
          (e.containerInitialized = !0),
          an(ie, !0));
      }
    };
  var le;
  function ue() {
    let e = document.createElement('iframe');
    ((e.title = p() || ''), (e.src = ee()));
    let t = ((e) => {
      if (!e) return;
      let t = e;
      return (
        t.forEach((n, r) => {
          ((t[r] = n + (n.indexOf(';') == -1 ? ';' : '')), (t[r] = e[r].replaceAll('"', "'")));
        }),
        t.join(' ')
      );
    })(r());
    (t && (e.allow = t), v() && (e.sandbox.value = v().join(' ')));
    let n = I(ae)?.iframeCreationInterceptor;
    if (typeof n == 'function')
      try {
        n(e, I(ae)?.viewGroup, I(ae)?._luigiCurrentNode, I(ae)?._luigiMicroFrontendType);
      } catch (e) {
        console.error('Error applying iframe creation interceptor: ', e);
      }
    ((ne.iframe = e), I(re).appendChild(e));
  }
  (Nr(async () => {
    (an(ae, I(re).parentNode),
      rn(ae, (I(ae).iframeHandle = ne)),
      rn(
        ae,
        (I(ae).init = () => {
          ce(I(ae));
        })
      ),
      !c() && ee() && ce(I(ae)));
  }),
    (le = async () => {}),
    T === null && Ie('onDestroy'),
    Nr(() => () => dr(le)),
    (function (e, t) {
      var n = {
        effect: null,
        ran: !1,
        deps: e
      };
      (T.l.$.push(n),
        (n.effect = jn(() => {
          if ((e(), !n.ran)) {
            n.ran = !0;
            var r = F;
            try {
              (qn(r.parent), dr(t));
            } finally {
              qn(r);
            }
          }
        })));
    })(
      () => (I(ie), fr(ee()), fr(c()), I(ae)),
      () => {
        !I(ie) && ee() && !c() && I(ae) && ce(I(ae));
      }
    ),
    (function () {
      var e = T;
      jn(() => {
        for (var t of e.l.$) {
          t.deps();
          var n = t.effect;
          ((n.f & pe) !== 0 && n.deps !== null && pt(n, he), rr(n) && cr(n), (t.ran = !1));
        }
      });
    })());
  var de = {
    unwarn: se,
    get activeFeatureToggleList() {
      return n();
    },
    set activeFeatureToggleList(e) {
      (n(e), k());
    },
    get allowRules() {
      return r();
    },
    set allowRules(e) {
      (r(e), k());
    },
    get anchor() {
      return i();
    },
    set anchor(e) {
      (i(e), k());
    },
    get authData() {
      return a();
    },
    set authData(e) {
      (a(e), k());
    },
    get clientPermissions() {
      return o();
    },
    set clientPermissions(e) {
      (o(e), k());
    },
    get context() {
      return s();
    },
    set context(e) {
      (s(e), k());
    },
    get deferInit() {
      return c();
    },
    set deferInit(e) {
      (c(e), k());
    },
    get dirtyStatus() {
      return l();
    },
    set dirtyStatus(e) {
      (l(e), k());
    },
    get documentTitle() {
      return u();
    },
    set documentTitle(e) {
      (u(e), k());
    },
    get hasBack() {
      return d();
    },
    set hasBack(e) {
      (d(e), k());
    },
    get label() {
      return p();
    },
    set label(e) {
      (p(e), k());
    },
    get locale() {
      return m();
    },
    set locale(e) {
      (m(e), k());
    },
    get noShadow() {
      return h();
    },
    set noShadow(e) {
      (h(e), k());
    },
    get nodeParams() {
      return g();
    },
    set nodeParams(e) {
      (g(e), k());
    },
    get pathParams() {
      return _();
    },
    set pathParams(e) {
      (_(e), k());
    },
    get sandboxRules() {
      return v();
    },
    set sandboxRules(e) {
      (v(e), k());
    },
    get searchParams() {
      return y();
    },
    set searchParams(e) {
      (y(e), k());
    },
    get skipCookieCheck() {
      return b();
    },
    set skipCookieCheck(e) {
      (b(e), k());
    },
    get skipInitCheck() {
      return x();
    },
    set skipInitCheck(e) {
      (x(e), k());
    },
    get theme() {
      return S();
    },
    set theme(e) {
      (S(e), k());
    },
    get userSettings() {
      return C();
    },
    set userSettings(e) {
      (C(e), k());
    },
    get viewurl() {
      return ee();
    },
    set viewurl(e) {
      (ee(e), k());
    },
    get webcomponent() {
      return te();
    },
    set webcomponent(e) {
      (te(e), k());
    }
  };
  Ur();
  var fe = si(),
    me = (function (e, t) {
      if (!Ve) return yn(e);
      var n = yn(w);
      if (n === null) n = w.appendChild(vn());
      else if (t && n.nodeType !== 3) {
        var r = vn();
        return (n?.before(r), Ue(r), r);
      }
      return (t && Sn(n), Ue(n), n);
    })(fe),
    ge = (e) => {
      var t = (function () {
          if (Ve) return (xr(w, null), w);
          var e = document.createDocumentFragment(),
            t = document.createComment(''),
            n = vn();
          return (e.append(t, n), xr(t, n), e);
        })(),
        n = (function (e, t = !1) {
          if (!Ve) {
            var n = yn(e);
            return n instanceof Comment && n.data === '' ? bn(n) : n;
          }
          if (t) {
            if (w?.nodeType !== 3) {
              var r = vn();
              return (w?.before(r), Ue(r), r);
            }
            Sn(w);
          }
          return w;
        })(t),
        r = (e) => {
          Cr(e, oi());
        };
      (Fr(n, (e) => {
        (te() && te() !== 'false') || e(r);
      }),
        Cr(e, t));
    };
  return (
    Fr(me, (e) => {
      I(ie) && e(ge);
    }),
    (function (e) {
      if (Ve) {
        if (bn(w) !== null) throw (ze(), f);
        w = e;
      }
    })(fe),
    Hr(
      fe,
      (e) => an(re, e),
      () => I(re)
    ),
    (function (e, t = [], n = [], r = []) {
      It(r, t, n, (t) => {
        Tn(8, () => e(...t.map(I)));
      });
    })(() => Br(fe, 1, Rr(te() ? void 0 : 'lui-isolated'))),
    Cr(e, fe),
    L(t, 'unwarn', se),
    rt(de)
  );
}
qr(
  ci,
  {
    activeFeatureToggleList: {
      attribute: 'active-feature-toggle-list',
      type: 'Array'
    },
    allowRules: {
      attribute: 'allow-rules',
      type: 'Array'
    },
    anchor: {
      attribute: 'anchor',
      type: 'String'
    },
    authData: {
      attribute: 'auth-data',
      type: 'Object'
    },
    clientPermissions: {
      attribute: 'client-permissions',
      type: 'Object'
    },
    context: {
      attribute: 'context',
      type: 'String'
    },
    deferInit: {
      attribute: 'defer-init',
      type: 'Boolean'
    },
    dirtyStatus: {
      attribute: 'dirty-status',
      type: 'Boolean'
    },
    documentTitle: {
      attribute: 'document-title',
      type: 'String'
    },
    hasBack: {
      attribute: 'has-back',
      type: 'Boolean'
    },
    label: {
      attribute: 'label',
      type: 'String'
    },
    locale: {
      attribute: 'locale',
      type: 'String'
    },
    noShadow: {
      attribute: 'no-shadow',
      type: 'Boolean'
    },
    nodeParams: {
      attribute: 'node-params',
      type: 'Object'
    },
    pathParams: {
      attribute: 'path-params',
      type: 'Object'
    },
    sandboxRules: {
      attribute: 'sandbox-rules',
      type: 'Array'
    },
    searchParams: {
      attribute: 'search-params',
      type: 'Object'
    },
    skipCookieCheck: {
      attribute: 'skip-cookie-check',
      type: 'String'
    },
    skipInitCheck: {
      attribute: 'skip-init-check',
      type: 'Boolean'
    },
    theme: {
      attribute: 'theme',
      type: 'String'
    },
    userSettings: {
      attribute: 'user-settings',
      type: 'Object'
    },
    viewurl: {
      attribute: 'viewurl',
      type: 'String'
    },
    webcomponent: {
      attribute: 'webcomponent',
      type: 'String'
    }
  },
  [],
  ['unwarn'],
  void 0,
  (e) => {
    let t = (e) => () =>
      console.warn(e + " can't be called on luigi-container before its micro frontend is attached to the DOM.");
    return class extends e {
      sendCustomMessage = t('sendCustomMessage');
      updateContext = t('updateContext');
      updateViewUrl = t('updateViewUrl');
      closeAlert = t('closeAlert');
      notifyAlertClosed = t('notifyAlertClosed');
      notifyConfirmationModalClosed = t('notifyConfirmationModalClosed');
      attributeChangedCallback(e, t, n) {
        try {
          super.attributeChangedCallback(e, t, n);
        } catch (e) {
          console.error('Error in super.attributeChangedCallback', e);
        }
        this.containerInitialized &&
          (e === 'context' && this.updateContext(JSON.parse(n)),
          e === 'auth-data' && Zr.updateAuthData(this.iframeHandle, JSON.parse(n)));
      }
      getNoShadow() {
        return this.hasAttribute('no-shadow') || this.noShadow;
      }
    };
  }
);
var li = Sr('<main class="svelte-1yfh4yd"></main>'),
  ui = {
    hash: 'svelte-1yfh4yd',
    code: 'main.svelte-1yfh4yd {width:100%;height:100%;border:none;}'
  };
function di(e, t) {
  (nt(t, !1), Ir(e, ui));
  let n,
    r = z(t, 'activeFeatureToggleList', 12),
    i = z(t, 'anchor', 12),
    a = z(t, 'clientPermissions', 12),
    o = z(t, 'compoundConfig', 12),
    s = z(t, 'context', 12),
    c = z(t, 'deferInit', 12),
    l = z(t, 'dirtyStatus', 12),
    u = z(t, 'documentTitle', 12),
    d = z(t, 'hasBack', 12),
    f = z(t, 'locale', 12),
    p = z(t, 'noShadow', 12),
    m = z(t, 'nodeParams', 12),
    h = z(t, 'pathParams', 12),
    g = z(t, 'searchParams', 12),
    _ = z(t, 'skipInitCheck', 12),
    v = z(t, 'theme', 12),
    y = z(t, 'userSettings', 12),
    b = z(t, 'viewurl', 12),
    x = z(t, 'webcomponent', 12),
    S = !1,
    C = nn(),
    ee = new Yr(),
    te = new ii(),
    ne = () => r() && i() && a() && l() && u() && d() && f() && p() && m() && h() && g() && _() && v() && y(),
    re = (e) => {
      if (!o() || S) return;
      e.updateContext = (t, n) => {
        let r = e.getNoShadow() ? e : I(C);
        ((r._luigi_mfe_webcomponent.context = t), s(t));
        let i = r._luigi_mfe_webcomponent;
        i &&
          i.querySelectorAll('[lui_web_component]')?.forEach((e) => {
            let n = e.context || {};
            e.context = Object.assign(n, t);
          });
      };
      let t = ai.resolveContext(s());
      (c(!1),
        (e.notifyAlertClosed = (t, n) => {
          e.isConnected && te.resolveAlert(t, n);
        }),
        (e.notifyConfirmationModalClosed = (t) => {
          e.isConnected && te.notifyConfirmationModalClosed(!!t);
        }));
      let r = {
        compound: o(),
        viewUrl: b(),
        webcomponent: ai.checkWebcomponentValue(x()) || !0
      };
      (e.getNoShadow()
        ? (e.innerHTML = '')
        : (rn(C, (I(C).innerHTML = '')), e.attachShadow({ mode: 'open' }).append(I(C))),
        te.renderWebComponentCompound(r, e.getNoShadow() ? e : I(C), t).then((t) => {
          ((n = t),
            _() || !r.viewUrl
              ? ((e.initialized = !0),
                setTimeout(() => {
                  te.dispatchLuigiEvent(V.INITIALIZED, {});
                }))
              : n.LuigiClient &&
                !n.deferLuigiClientWCInit &&
                ((e.initialized = !0), te.dispatchLuigiEvent(V.INITIALIZED, {})));
        }),
        (S = !0),
        (e.containerInitialized = !0));
    };
  Nr(async () => {
    let e = I(C).getRootNode() === document ? I(C).parentNode : I(C).getRootNode().host;
    ((e.init = () => {
      re(e);
    }),
      c() || re(e),
      ee.registerContainer(e),
      (te.thisComponent = e));
  });
  var ie = {
    unwarn: ne,
    get activeFeatureToggleList() {
      return r();
    },
    set activeFeatureToggleList(e) {
      (r(e), k());
    },
    get anchor() {
      return i();
    },
    set anchor(e) {
      (i(e), k());
    },
    get clientPermissions() {
      return a();
    },
    set clientPermissions(e) {
      (a(e), k());
    },
    get compoundConfig() {
      return o();
    },
    set compoundConfig(e) {
      (o(e), k());
    },
    get context() {
      return s();
    },
    set context(e) {
      (s(e), k());
    },
    get deferInit() {
      return c();
    },
    set deferInit(e) {
      (c(e), k());
    },
    get dirtyStatus() {
      return l();
    },
    set dirtyStatus(e) {
      (l(e), k());
    },
    get documentTitle() {
      return u();
    },
    set documentTitle(e) {
      (u(e), k());
    },
    get hasBack() {
      return d();
    },
    set hasBack(e) {
      (d(e), k());
    },
    get locale() {
      return f();
    },
    set locale(e) {
      (f(e), k());
    },
    get noShadow() {
      return p();
    },
    set noShadow(e) {
      (p(e), k());
    },
    get nodeParams() {
      return m();
    },
    set nodeParams(e) {
      (m(e), k());
    },
    get pathParams() {
      return h();
    },
    set pathParams(e) {
      (h(e), k());
    },
    get searchParams() {
      return g();
    },
    set searchParams(e) {
      (g(e), k());
    },
    get skipInitCheck() {
      return _();
    },
    set skipInitCheck(e) {
      (_(e), k());
    },
    get theme() {
      return v();
    },
    set theme(e) {
      (v(e), k());
    },
    get userSettings() {
      return y();
    },
    set userSettings(e) {
      (y(e), k());
    },
    get viewurl() {
      return b();
    },
    set viewurl(e) {
      (b(e), k());
    },
    get webcomponent() {
      return x();
    },
    set webcomponent(e) {
      (x(e), k());
    }
  };
  Ur();
  var ae = li();
  return (
    Hr(
      ae,
      (e) => an(C, e),
      () => I(C)
    ),
    Cr(e, ae),
    L(t, 'unwarn', ne),
    rt(ie)
  );
}
(qr(
  di,
  {
    activeFeatureToggleList: {
      attribute: 'active-feature-toggle-list',
      type: 'Array'
    },
    anchor: {
      attribute: 'anchor',
      type: 'String'
    },
    clientPermissions: {
      attribute: 'client-permissions',
      type: 'Object'
    },
    compoundConfig: {
      attribute: 'compound-config',
      type: 'Object'
    },
    context: {
      attribute: 'context',
      type: 'String'
    },
    deferInit: {
      attribute: 'defer-init',
      type: 'Boolean'
    },
    dirtyStatus: {
      attribute: 'dirty-status',
      type: 'Boolean'
    },
    documentTitle: {
      attribute: 'document-title',
      type: 'String'
    },
    hasBack: {
      attribute: 'has-back',
      type: 'Boolean'
    },
    locale: {
      attribute: 'locale',
      type: 'String'
    },
    noShadow: {
      attribute: 'no-shadow',
      type: 'Boolean'
    },
    nodeParams: {
      attribute: 'node-params',
      type: 'Object'
    },
    pathParams: {
      attribute: 'path-params',
      type: 'Object'
    },
    searchParams: {
      attribute: 'search-params',
      type: 'Object'
    },
    skipInitCheck: {
      attribute: 'skip-init-check',
      type: 'Boolean'
    },
    theme: {
      attribute: 'theme',
      type: 'String'
    },
    userSettings: {
      attribute: 'user-settings',
      type: 'Object'
    },
    viewurl: {
      attribute: 'viewurl',
      type: 'String'
    },
    webcomponent: {
      attribute: 'webcomponent',
      type: 'String'
    }
  },
  [],
  ['unwarn'],
  void 0,
  (e) => {
    let t = (e) => () =>
      console.warn(e + " can't be called on luigi-container before its micro frontend is attached to the DOM.");
    return class extends e {
      updateContext = t('updateContext');
      notifyAlertClosed = t('notifyAlertClosed');
      notifyConfirmationModalClosed = t('notifyConfirmationModalClosed');
      attributeChangedCallback(e, t, n) {
        try {
          super.attributeChangedCallback(e, t, n);
        } catch (e) {
          console.warn('Error in attributeChangedCallback', e);
        }
        this.containerInitialized && e === 'context' && this.updateContext(JSON.parse(n));
      }
      getNoShadow() {
        return this.hasAttribute('no-shadow') || this.noShadow;
      }
    };
  }
),
  customElements.get('luigi-container') || customElements.define('luigi-container', ci.element),
  customElements.get('luigi-compound-container') || customElements.define('luigi-compound-container', di.element));
//#endregion
//#region src/utilities/helpers/escaping-helpers.ts
var fi = {
    sanitizeHtml(e = '') {
      return e
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');
    },
    restoreSanitizedBrs(e = '') {
      return e
        .replace(/&lt;br\/&gt;/g, '<br>')
        .replace(/&lt;br \/&gt;/g, '<br>')
        .replace(/&lt;br&gt;/g, '<br>')
        .replace(/&lt;br &gt;/g, '<br>');
    },
    restoreSanitizedElements(e = '') {
      let t = e,
        n = ['i', 'b', 'br', 'mark', 'strong', 'em', 'small', 'del', 'ins', 'sub', 'sup'];
      for (let e = 0; e < n.length; e++) {
        let r = RegExp(`&lt;${n[e]}\/&gt;`, 'g'),
          i = RegExp(`&lt;${n[e]} \/&gt;`, 'g'),
          a = RegExp(`&lt;${n[e]}&gt;`, 'g'),
          o = RegExp(`&lt;${n[e]} &gt;`, 'g'),
          s = RegExp(`&lt;\/${n[e]}[\/]&gt;`, 'g'),
          c = RegExp(`&lt;\/${n[e]} [\/]&gt;`, 'g'),
          l = RegExp(`&lt;[\/]${n[e]}&gt;`, 'g'),
          u = RegExp(`&lt;[\/]${n[e]} &gt;`, 'g');
        t = t
          .replace(r, `<${n[e]}>`)
          .replace(i, `<${n[e]}>`)
          .replace(a, `<${n[e]}>`)
          .replace(o, `<${n[e]}>`)
          .replace(s, `</${n[e]}>`)
          .replace(c, `</${n[e]}>`)
          .replace(l, `</${n[e]}>`)
          .replace(u, `</${n[e]}>`);
      }
      return t;
    },
    sanatizeHtmlExceptTextFormatting(e = '') {
      return this.restoreSanitizedElements(this.sanitizeHtml(e));
    },
    sanitizeParam(e = '') {
      return String(e)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&sol;');
    },
    escapeKeyForRegexp(e = '') {
      return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },
    processTextAndLinks(e = '', t, n) {
      let r = {
        sanitizedText: this.restoreSanitizedBrs(this.sanitizeHtml(e)),
        links: []
      };
      return t
        ? Object.entries(t).reduce((e, [t, r]) => {
            let i = `_luigi_alert_${n}_link_${this.sanitizeParam(t)}`,
              a = `<a id="${i}">${this.restoreSanitizedBrs(this.sanitizeHtml(r.text))}</a>`,
              o = this.escapeKeyForRegexp(t),
              s = RegExp(`({${o}})`, 'g');
            return {
              sanitizedText: e.sanitizedText.replace(s, a),
              links: e.links.concat({
                elemId: i,
                url: r.url ? encodeURI(this.sanitizeHtml(r.url)) : void 0,
                dismissKey: r.dismissKey ? encodeURI(this.sanitizeHtml(r.dismissKey)) : void 0
              })
            };
          }, r)
        : r;
    }
  },
  H = {
    normalizePath: (e) => {
      if (!e || e.length <= 0) return e;
      let t = e;
      (t.startsWith('#') && (t = t.substring(1)), t.startsWith('/') && (t = t.substring(1)));
      let n = t.indexOf('#');
      return (n !== -1 && n !== t.length - 1 && (t = t.split('#')[0]), t);
    },
    segmentMatches: (e, t, n) => !!(e === t || (t.startsWith(':') && n && n[t.substr(1)] === e)),
    checkMatch: (e, t, n) => {
      let r = !0;
      return (
        a
          .trimTrailingSlash(a.trimLeadingSlash(e))
          .split('/')
          .forEach((e, i) => {
            r &&
              (i + 1 >= t.length ||
                !t[i + 1]?.pathSegment ||
                !H.segmentMatches(e, t[i + 1]?.pathSegment ?? '', n ?? {})) &&
              (r = !1);
          }),
        r
      );
    },
    checkVisibleForFeatureToggles: (e, t) => {
      if (e?.visibleForFeatureToggles) {
        let n = t?.getActiveFeatureToggleList() || [];
        for (let t of e.visibleForFeatureToggles)
          if (t.startsWith('!')) {
            if (n.includes(t.slice(1))) return !1;
          } else if (!n.includes(t)) return !1;
      }
      return !0;
    },
    generateTooltipText: (e, t, n) => {
      let r = e?.tooltipText;
      switch ((r === void 0 && (r = n.getConfigValue('navigation.defaults.tooltipText')), r)) {
        case void 0:
          return t;
        case !1:
          return '';
        default:
          return n.i18n().getTranslation(r);
      }
    },
    isNodeAccessPermitted: (e, t, n, r) => {
      if (r.auth().isAuthorizationEnabled()) {
        let t = u.isLoggedIn(),
          n = e.anonymousAccess;
        if ((t && n === 'exclusive') || (!t && n !== 'exclusive' && n !== !0)) return !1;
      }
      let i = r.featureToggles();
      if (!H.checkVisibleForFeatureToggles(e, i)) return !1;
      let a = r.getConfigValue('navigation.nodeAccessibilityResolver');
      return typeof a == 'function' ? a(e, t, n) : !0;
    },
    updateHeaderTitle: (e, t) => {
      let n = e?.items;
      if (n && t) {
        let e = '';
        return (
          [...n]
            .sort((e, t) => (t.link || '').localeCompare(e.link || ''))
            .some((n) => {
              let r = !1;
              if (
                ((r = H.checkMatch(n.link || '', t.nodesInPath ?? [])),
                !r &&
                  n.selectionConditions &&
                  n.selectionConditions.route &&
                  ((r = H.checkMatch(n.selectionConditions.route, t.nodesInPath ?? [])),
                  r &&
                    (n.selectionConditions.contextCriteria || []).forEach((e) => {
                      r &&= t?.selectedNode?.context?.[e.key] === e.value;
                    })),
                r)
              )
                return ((e = n.title || ''), !0);
            }),
          e
        );
      }
    },
    buildPath(e, t) {
      return e
        .map((e) => {
          let n = e.pathSegment;
          if (n?.startsWith(':')) {
            let e = n.slice(1),
              r = t?.pathParams?.[e];
            if (r != null) return encodeURIComponent(String(r));
          }
          return n;
        })
        .join('/');
    },
    mergeContext(e, t, n) {
      let r = [...(e.parentNavigationContexts || [])];
      return (
        n && r.unshift(n),
        {
          ...e,
          ...(t || {}),
          parentNavigationContexts: r
        }
      );
    },
    prepareForTests(...e) {
      let t = '';
      return (
        e.forEach((e) => {
          e && (t += (t ? '_' : '') + encodeURIComponent(e.toLowerCase().split(' ').join('')));
        }),
        t
      );
    },
    findVirtualTreeRootNode(e) {
      if (e.virtualTree) return e;
      if (e.parent) return H.findVirtualTreeRootNode(e.parent);
    },
    validatePathAndGetRedirect: async (e, t) => {
      let n = await U.pathExists(e, t);
      return (await U.handlePageNotFoundAndRetrieveRedirectPath(e, n, t)) || void 0;
    },
    async fetchNodeTitleData(e, t) {
      return new Promise((n, r) => {
        if (!e.titleResolver) {
          r(/* @__PURE__ */ Error('No title resolver defined at node'));
          return;
        }
        let i = { ...e.titleResolver };
        delete i._cache;
        let a = this.substituteVars(i, t),
          o = JSON.stringify(a);
        if (e.titleResolver._cache && e.titleResolver._cache.key === o) {
          n(e.titleResolver._cache.value);
          return;
        }
        let s = a.request;
        this._fetch(s.url, {
          method: s.method,
          headers: s.headers,
          body: JSON.stringify(s.body)
        })
          .then((t) => {
            t.json().then((t) => {
              try {
                let r = this.processTitleData(t, a);
                ((e.titleResolver._cache = {
                  key: o,
                  value: r
                }),
                  n(r));
              } catch (e) {
                r(e);
              }
            });
          })
          .catch((e) => {
            r(e);
          });
      });
    },
    getPropertyChainValue(e, t, n) {
      return !t || !e ? n : (0, i.get)(e, t, n);
    },
    substituteVars(e, t) {
      let n = JSON.stringify(e).replace(/\$\{[a-zA-Z0-9$_.]+\}/g, (e) => {
        let n = e.substr(2, e.length - 3);
        return this.getPropertyChainValue(t, n) || e;
      });
      return JSON.parse(n);
    },
    _fetch(e, t) {
      return fetch(e, t);
    },
    processTitleData(e, t) {
      let n = this.getPropertyChainValue(e, t.titlePropertyChain);
      return (
        (n &&= n.trim()),
        n && t.titleDecorator && (n = t.titleDecorator.replace('%s', n)),
        {
          label: n || t.fallbackTitle,
          icon: this.getPropertyChainValue(e, t.iconPropertyChain, t.fallbackIcon)
        }
      );
    },
    getUrlOrigin(e) {
      let t = document.createElement('a');
      return ((t.href = e), t.origin || void 0);
    },
    findViewGroup(e, t) {
      if (e.viewGroup)
        return t && t !== e
          ? e.viewUrl && t.viewUrl && H.getUrlOrigin(e.viewUrl) === H.getUrlOrigin(t.viewUrl)
            ? e.viewGroup
            : void 0
          : e.viewGroup;
      if (e.parent) return H.findViewGroup(e.parent, t || e);
    },
    openExternalLink(e, t) {
      let n = e.url;
      if ((t && (n = a.replaceVars(n, t, ':', !1)), e.sameWindow)) window.location.href = n;
      else {
        let e = window.open(n, '_blank', 'noopener noreferrer');
        e && ((e.opener = null), e.focus());
      }
    }
  },
  U = {
    defaultContentViewParamPrefix: '~',
    defaultQueryParamSeparator: '?',
    defaultModalViewParamName: 'modal',
    addParamsOnHashRouting(e, t, n) {
      let r = t,
        [i, a] = r.split('?'),
        o = new URLSearchParams(a);
      return (this.modifySearchParams(e, o, n), (r = i), o.toString() !== '' && (r += `?${o.toString()}`), r);
    },
    modifySearchParams(e, t, n) {
      for (let [r, i] of Object.entries(e)) {
        let e = n ? `${n}${r}` : r;
        (t.set(e, i), i === void 0 && t.delete(e));
      }
    },
    filterNodeParams(e, t) {
      let n = Object.create(null),
        r = this.getContentViewParamPrefix(t);
      return (
        e &&
          Object.entries(e).forEach((e) => {
            if (e[0].startsWith(r)) {
              let t = e[0].substr(r.length);
              n[t] = e[1];
            }
          }),
        this.sanitizeParamsMap(n)
      );
    },
    mapPathToNode(e, t) {
      if (!e || !t) return;
      let n = a.trimLeadingSlash(e).split('/'),
        r = U.buildRoute(t, `/${t.pathSegment}`),
        i = a.trimLeadingSlash(r).split('/');
      if (n.length < i.length) return;
      let o = '';
      for (let e = 0; e < i.length; e++) {
        if (n[e] !== i[e] && i[e].indexOf(':') !== 0) return;
        o += '/' + n[e];
      }
      return o;
    },
    resolveNodeLabel(e, t) {
      let n = t.i18n().getTranslation(e.label) || e.label;
      if (!n.includes('{viewGroupData.')) return n;
      let r = e.viewGroup || H.findViewGroup(e);
      if (r) {
        let e = (t.getConfigValue('navigation.viewGroupSettings') || {})[r] || {},
          i = {
            ...(e.customData || {}),
            ...(e._liveCustomData || {})
          };
        n = a.replaceVars(n, i, 'viewGroupData.');
      } else n = a.replaceVars(n, {}, 'viewGroupData.');
      return n;
    },
    async getNodeLabel(e, t) {
      if (e.label && !e._virtualTree) return U.resolveNodeLabel(e, t);
      if (e.pathSegment && e.pathSegment.indexOf(':') === 0) {
        let n = t.getConfig().routing?.useHashRouting,
          r = U.mapPathToNode(U.getCurrentPath(t, n)?.path, e) || '',
          i = await t.navigation().navService.extractDataFromPath(r);
        return U.getDynamicNodeValue(e, i.pathData.pathParams) || '';
      }
      return e.pathSegment ? e.pathSegment : '';
    },
    getContentViewParamPrefix(e) {
      let t = e?.getConfigValue('routing.nodeParamPrefix');
      return (t === !1 ? (t = '') : (t ||= this.defaultContentViewParamPrefix), t);
    },
    sanitizeParamsMap(e) {
      return Object.entries(e).reduce((e, t) => ((e[fi.sanitizeParam(t[0])] = fi.sanitizeParam(t[1])), e), {});
    },
    prepareSearchParamsForClient(e, t) {
      let n = {};
      return (
        e &&
          e.clientPermissions &&
          e.clientPermissions.urlParameters &&
          Object.keys(e.clientPermissions.urlParameters).forEach((r) => {
            r in t.routing().getSearchParams() &&
              e.clientPermissions?.urlParameters &&
              e.clientPermissions.urlParameters[r]?.read === !0 &&
              (n[r] = t.routing().getSearchParams()[r]);
          }),
        n
      );
    },
    hasIntent(e) {
      return !!e && e.toLowerCase().includes('#?intent=');
    },
    getIntentObject(e) {
      let t = e.split('?intent=')[1];
      if (t) {
        let e = t.split('?'),
          n = e[0].split('-'),
          r = Object.fromEntries(new URLSearchParams(e[1]).entries());
        return {
          semanticObject: n[0],
          action: n[1],
          params: r
        };
      }
    },
    getIntentPath(e, t) {
      let n = t.getConfigValue('navigation.intentMapping');
      if (n && n.length > 0) {
        let r = e.replace(/\?intent=/i, '?intent='),
          i = this.getIntentObject(r);
        if (i) {
          let e = n.find((e) => e.semanticObject === i.semanticObject && e.action === i.action);
          if (!e) return !1;
          if (e.externalLink)
            return {
              ...e.externalLink,
              external: !0
            };
          e = e.pathSegment;
          let r = Object.entries(i.params);
          if (r && r.length > 0) {
            e = this.resolveDynamicIntentPath(e, i.params);
            let n = t.getConfigValue('routing.nodeParamPrefix');
            ((n ||= '~'),
              (e = e.concat(`?${n}`)),
              r.forEach(([t, r], i) => {
                e += `${i > 0 ? '&' + n : ''}${t}=${r}`;
              }));
          }
          return e;
        } else console.warn('Could not parse given intent link.');
      } else console.warn('No intent mappings are defined in Luigi configuration.');
      return !1;
    },
    resolveDynamicIntentPath(e, t) {
      if (!t) return e;
      let n = e;
      for (let [e, r] of Object.entries(t)) {
        let t = RegExp('/:' + e + '(/|$)', 'g');
        n = n.replace(t, `/${r}/`);
      }
      return ((n = n.replace(/\/$/, '')), n);
    },
    getCurrentPath(e, t, n) {
      if (n && /\?intent=/i.test(location.hash)) {
        let n = location.hash.replace('#/#', '').replace('#', ''),
          r = U.getIntentPath(n, e);
        if (r) {
          if (typeof r == 'string')
            return (
              e?.getConfigValue('routing.replaceIntentRoute') && history.replaceState(window.state, '', r),
              {
                path: r,
                query: location.search
              }
            );
          if (a.isObject(r))
            return (
              U.handleExternalIntentPath(r),
              {
                path: t ? location.hash : location.pathname,
                query: ''
              }
            );
        }
      }
      if (t) {
        let [e, t] = H.normalizePath(location.hash).split('?');
        return {
          path: e.replace('#', ''),
          query: t
        };
      } else
        return {
          path: H.normalizePath(location.pathname),
          query: location.search
        };
    },
    handleExternalIntentPath(e) {
      if (e.external && e.url) {
        let t = e.openInNewTab ? '_blank' : '_self';
        window.open(e.url, t, 'noopener,noreferrer')?.focus();
      }
    },
    getModalPathFromPath(e) {
      return this.getQueryParam(this.getModalViewParamName(e), e);
    },
    getQueryParam(e, t) {
      return this.getQueryParams(t)[e];
    },
    getQueryParams(e) {
      return e.getConfigValue('routing.useHashRouting')
        ? this.getLocationHashQueryParams()
        : this.getLocationSearchQueryParams();
    },
    getLocationSearchQueryParams() {
      return U.getLocation().search ? U.parseParams(U.getLocation().search.slice(1)) : {};
    },
    getLocation() {
      return location;
    },
    getLocationHashQueryParams() {
      let e = U.getLocation().hash.indexOf(this.defaultQueryParamSeparator);
      return e === -1 ? {} : U.parseParams(U.getLocation().hash.slice(e + 1));
    },
    getModalViewParamName(e) {
      let t = e.getConfigValue('routing.modalPathParam');
      return ((t ||= this.defaultModalViewParamName), t);
    },
    parseParams(e) {
      let t = new URLSearchParams(e),
        n = /* @__PURE__ */ new Map();
      for (let [e, r] of t.entries()) n.set(e, r);
      return Object.fromEntries(n);
    },
    getModalParamsFromPath(e) {
      let t = this.getQueryParam(`${this.getModalViewParamName(e)}Params`, e);
      return t && JSON.parse(t);
    },
    getHashQueryParamSeparator() {
      return this.defaultQueryParamSeparator;
    },
    getURLWithoutModalData(e, t) {
      let n = new URLSearchParams(e);
      return (n.delete(t), n.delete(`${t}Params`), n.toString());
    },
    handleHistoryState(e, t) {
      return (
        e && e.modalHistoryLength
          ? (e.modalHistoryLength += 1)
          : (e = {
              modalHistoryLength: 1,
              historygap: history.length,
              pathBeforeHistory: t
            }),
        e
      );
    },
    encodeParams(e) {
      let t = [];
      for (let n in e) t.push(encodeURIComponent(n) + '=' + encodeURIComponent(e[n]));
      return t.join('&');
    },
    getLastNodeObject(e) {
      return (e.nodesInPath ? [...e.nodesInPath].pop() : {}) || {};
    },
    checkWCUrl(e, t) {
      if (e.indexOf('://') > 0 || e.trim().indexOf('//') === 0) {
        if (new URL(e).host === window.location.host) return !0;
        let n = t.getConfigValue('navigation.validWebcomponentUrls');
        if (n?.length > 0)
          for (let t of n)
            try {
              if (new RegExp(t).test(e)) return !0;
            } catch (e) {
              console.error(e);
            }
        return !1;
      }
      return !0;
    },
    setFeatureToggles(e, t, n) {
      let r = this.sanitizeParamsMap(this.parseParams(t.split('?')[1])),
        i;
      if ((r[e] && (i = r[e]), !i)) return;
      let a = i.split(',');
      a.length > 0 && a[0] !== '' && a.forEach((e) => n?.setFeatureToggle(e, !0));
    },
    substituteDynamicParamsInObject(e, t, n = ':', r = !1) {
      return Object.entries(e)
        .map(([e, i]) => {
          let a = r ? Object.keys(t).find((e) => i && i.indexOf(n + e) >= 0) : Object.keys(t).find((e) => i === n + e);
          return [e, a ? (r ? i.replace(n + a, t[a]) : t[a]) : i];
        })
        .reduce((e, [t, n]) => Object.assign(e, { [t]: n }), {});
    },
    isDynamicNode(e) {
      return typeof e.pathSegment == 'string' && e.pathSegment.length > 0 && e.pathSegment[0] === ':';
    },
    getDynamicNodeValue(e, t) {
      return this.isDynamicNode(e) && e.pathSegment ? t[e.pathSegment.substring(1)] : void 0;
    },
    isExistingRoute(e, t) {
      let n = e?.split('/') || [],
        r = t?.nodesInPath || [],
        i = (e, t) => {
          let n = null;
          if (e?.children?.length) {
            let r = e.children.filter((e) => e.pathSegment === t);
            r?.length && (n = r[0]);
          }
          return n;
        },
        a = [];
      if (n.length > 1 && r.length === 1) {
        let e;
        n.forEach((t, n) => {
          ((e = i(n === 0 ? r[0] : e, t)), e?.pathSegment && a.push(e.pathSegment));
        });
      } else a = r.filter((e) => e.pathSegment).map((e) => e.pathSegment || '');
      return !e || n.length === a.length;
    },
    async pathExists(e, t) {
      let n = a.getTrimmedUrl(e),
        r = await t.navigation().navService.getPathData(e),
        i = U.isExistingRoute(n, r);
      return r ? i : !1;
    },
    showRouteNotFoundAlert(e, t = !1, n) {
      let r = {
        text: n.i18n().getTranslation(t ? 'luigi.notExactTargetNode' : 'luigi.requestedRouteNotFound', { route: e }),
        type: 'error',
        ttl: 1
      };
      n.ux().showAlert(r);
    },
    getPageNotFoundRedirectResult(e, t = !1, n) {
      let r = n.getConfigValue('routing.pageNotFoundHandler');
      if (typeof r == 'function') {
        let n = r(e, t);
        if (n && (n.redirectTo || n.ignoreLuigiErrorHandling))
          return {
            path: n.redirectTo,
            keepURL: n.keepURL,
            ignoreLuigiErrorHandling: n.ignoreLuigiErrorHandling
          };
      }
      return {};
    },
    async handlePageNotFoundAndRetrieveRedirectPath(e, t, n) {
      if (t) return e;
      let r = n.getConfigValue('routing.pageNotFoundHandler'),
        i = this.getPageNotFoundRedirectResult(e, r, n)?.path;
      if (i !== void 0) return i;
      (this.showRouteNotFoundAlert(e, !1, n), console.warn(`Could not find the requested route: ${e}`));
    },
    async getDefaultChildNode(e, t) {
      if (!e) return '';
      let n = e.nodesInPath && e.nodesInPath[e.nodesInPath.length - 1],
        r = e.context,
        i = t ? await t(n, r) : await o.getConfigValueFromObjectAsync(n, 'children', r),
        a = i.find((e) => e.pathSegment === n.defaultChildNode);
      if (n.defaultChildNode && a) return n.defaultChildNode;
      if (i && i.length) {
        if (e?.nodesInPath?.length === 1) {
          let e = i.find((e) => e.pathSegment);
          return (
            (e && e.pathSegment) ||
            console.error('At least one navigation node in the root hierarchy must have a pathSegment.')
          );
        }
        let t = i.find((e) => e.pathSegment && (e.viewUrl || e.compound || (e.externalLink && e.externalLink.url)));
        if (t) return t.pathSegment;
      }
      return '';
    },
    getNodePath(e, t) {
      return !e || t
        ? e
          ? this.buildRoute(e, e.pathSegment ? '/' + e.pathSegment : '', t)
          : ''
        : `${e.parent ? this.getNodePath(e.parent) : ''}/${e.pathSegment}`;
    },
    buildRoute(e, t, n) {
      return e.parent ? this.buildRoute(e.parent, `/${e.parent.pathSegment}${t}`, n) : t + (n ? '?' + n : '');
    },
    substituteViewUrl(e, t, n, r) {
      if (!e.viewUrl) return '';
      let i = e.viewUrl,
        o = 'routing.queryParams';
      if (
        (e.virtualTree && (i = i.replace('{virtualTreePath}', '')),
        (i = a.replaceVars(i, t, ':', !1)),
        e.context && (i = a.replaceVars(i, e.context, 'context.')),
        (i = a.replaceVars(i, n, 'nodeParams.')),
        (i = this.getI18nViewUrl(i, r)),
        i && i.includes(o))
      ) {
        let e = i.split('?')[1];
        if (e) {
          let t = e.split('=')[0],
            n = r.routing().getSearchParams();
          i = n[t] ? i.replace(`{${o}.${t}}`, n[t]) : i.replace(`?${t}={${o}.${t}}`, '');
        }
      }
      return i;
    },
    getI18nViewUrl(e, t) {
      let n = '{i18n.currentLocale}',
        r = t.i18n().getCurrentLocale();
      return e && e.includes(n) ? e.replace(n, r) : e;
    },
    getSubPath(e, t) {
      return a.replaceVars(U.getNodePath(e), t, ':', !1);
    },
    concatenatePath(e, t) {
      let n = a.getPathWithoutHashOrSlash(e);
      return n
        ? !t || typeof t != 'string'
          ? n
          : (n.endsWith('/') && (n = n.substring(0, n.length - 1)), t.startsWith('/') || (n += '/'), (n += t), n)
        : t;
    },
    getRouteLink(e, t, n) {
      let r = n || '';
      if (e.externalLink && e.externalLink.url) return e.externalLink.url;
      if (e.link) return r + e.link;
      let i = U.buildRoute(e, `/${e.pathSegment}`);
      return r + a.replaceVars(i, t, ':', !1, !0);
    },
    calculateNodeHref(e, t, n) {
      let r = n.getConfigValue('routing.useHashRouting') ? '#' : '',
        i = U.getRouteLink(e, t, r);
      return U.getI18nViewUrl(i, n) || i;
    },
    getNodeHref(e, t, n) {
      if (a.getConfigBooleanValue(n.getConfig(), 'navigation.addNavHrefs')) return U.calculateNodeHref(e, t, n);
    }
  },
  pi = {
    _fallbackLabels: /* @__PURE__ */ new Map(),
    resetFallbackLabelCache() {
      pi._fallbackLabels.clear();
    },
    getPreparedParentNodePath(e) {
      return (
        (!e.parentNodePath || !e.parentNodePath.startsWith('/')) &&
          console.error(
            'Luigi Config Error: navigation.contextSwitcher.parentNodePath must be defined as an absolute path.'
          ),
        e.parentNodePath ? a.addTrailingSlash(e.parentNodePath) : e.parentNodePath
      );
    },
    generateSwitcherNav(e, t) {
      let n = pi.getPreparedParentNodePath(e);
      return t.map((e) => ({
        label: e.label,
        link: (n || '/') + e.pathValue,
        id: e.pathValue,
        testId: e.testId,
        customRendererCategory: e.customRendererCategory
      }));
    },
    getNodePathFromCurrentPath(e, t, n) {
      let r = n.getConfig().routing?.useHashRouting,
        i = a.addLeadingSlash(U.getCurrentPath(n, r)?.path),
        o = a.addLeadingSlash(t.link);
      return i.startsWith(o) ? e.link + a.addLeadingSlash(i.substring(o.length)) : e.link;
    },
    getOptionById(e, t) {
      return e.find((e) => e.id === t);
    },
    getLabelFromOptions(e, t) {
      let n = e.find((e) => e.id === t);
      return n && n.label;
    },
    isContextSwitcherDetailsView(e, t) {
      let n = a.normalizePath(e),
        r = a.normalizePath(t);
      return !!(t && n && typeof n == 'string' && n.startsWith(r) && n !== r);
    },
    async getFallbackLabel(e, t, n) {
      if (!e) return t;
      let r = a.getConfigBooleanValue(n.getConfig(), 'navigation.contextSwitcher.useFallbackLabelCache'),
        i = pi._fallbackLabels;
      if (r && i.has(t)) return i.get(t);
      let o = await e(t);
      return (r && i.set(t, o), o);
    },
    getSelectedId(e, t, n) {
      if (((e = a.normalizePath(e)), (n = a.normalizePath(n)), pi.isContextSwitcherDetailsView(e, n)))
        return e.replace(n, '').split('/')[0].split('?')[0];
    },
    getSelectedOption(e, t, n) {
      let r = pi.getSelectedId(e, t, n),
        i;
      return (r && t && (i = pi.getOptionById(t, r)), i);
    },
    async getSelectedLabel(e, t, n, r, i) {
      let a = pi.getSelectedId(e, t, n);
      if (!a) return;
      let o = pi.getSelectedOption(e, t, n);
      return (o ? o.label : void 0) || (await pi.getFallbackLabel(r, a, i));
    },
    getSelectedNode(e, t, n) {
      if (!pi.getSelectedId(e, t, n)) return;
      let r = pi.getSelectedOption(e, t, n);
      return r ? r.link : void 0;
    },
    async fetchOptions(e, t = []) {
      let n = e.getConfigValue('navigation.contextSwitcher');
      if (!n.lazyloadOptions && t.length) return t;
      let r = await e.getConfigValueAsync('navigation.contextSwitcher.options');
      return await pi.generateSwitcherNav(n, r);
    }
  },
  mi = {
    handleSearchResultRenderer(e, t, n) {
      if (!e?.customSearchResultRenderer) return;
      let r = {
        customSearchResultItemRenderer: e?.customSearchResultItemRenderer,
        fireItemSelected: (t) => {
          e?.onSearchResultItemSelected &&
            typeof e.onSearchResultItemSelected == 'function' &&
            e.onSearchResultItemSelected(t);
        }
      };
      e.customSearchResultRenderer(t, n, r);
    },
    getSearchPlaceholder(e) {
      let t = e.getConfigValue('globalSearch.searchProvider')?.inputPlaceholder;
      if (t) {
        if (typeof t == 'function') return t();
        if (typeof t == 'string') {
          let n = e.i18n().getTranslation(t);
          return n && n.trim().length > 0 ? n : t;
        }
        if (typeof t == 'object') return t[e.i18n().getCurrentLocale()];
      }
    },
    toggleSearch(e, t, n) {
      if (t?.toggleSearch && a.isFunction(t.toggleSearch) && n) {
        let r = e === void 0 ? !0 : e;
        t.toggleSearch(n, r);
      } else console.warn('Toggle search method is not defined in the provider.');
    }
  },
  hi = {
    logout: {
      label: 'Sign Out',
      icon: 'log'
    },
    userSettingsProfileMenuEntry: {
      label: 'Settings',
      icon: 'settings'
    },
    userSettingsDialog: {
      dialogHeader: 'User Settings',
      saveBtn: 'Save',
      dismissBtn: 'Cancel'
    },
    globalSearchCenteredCancelButton: 'Cancel'
  },
  gi = class {
    luigi;
    unsavedChanges;
    constructor(e) {
      ((this.luigi = e),
        (this.luigi = e),
        (this.unsavedChanges = {
          isDirty: !1,
          persistUrl: null
        }));
    }
    updateDirtyStatus(e, t) {
      if (!this.unsavedChanges.dirtySet || !(this.unsavedChanges.dirtySet instanceof Set)) {
        let e = /* @__PURE__ */ new Set();
        (e.add(t), (this.unsavedChanges = { dirtySet: e }));
      }
      ((this.unsavedChanges.persistUrl = window.location.href),
        e ? this.unsavedChanges.dirtySet?.add(t) : this.unsavedChanges.dirtySet?.delete(t));
    }
    clearDirtyState(e) {
      this.unsavedChanges &&
        this.unsavedChanges.dirtySet &&
        (e ? this.unsavedChanges.dirtySet.delete(e) : this.unsavedChanges.dirtySet.clear());
    }
    readDirtyStatus() {
      return this.unsavedChanges.dirtySet ? this.unsavedChanges.dirtySet.size > 0 : !!this.unsavedChanges.isDirty;
    }
    getUnsavedChangesModalPromise(e) {
      if (!this.shouldShowUnsavedChangesModal(e)) return Promise.resolve();
      let t = this.luigi.getConfigValue('settings.unsavedChangesHandler');
      if (t) return t().then(() => this.clearDirtyState(e));
      let n = {
        header: this.luigi.i18n().getTranslation('luigi.unsavedChangesAlert.header'),
        body: this.luigi.i18n().getTranslation('luigi.unsavedChangesAlert.body'),
        buttonDismiss: this.luigi.i18n().getTranslation('luigi.button.dismiss'),
        buttonConfirm: this.luigi.i18n().getTranslation('luigi.button.confirm')
      };
      return new Promise((t, r) => {
        this.luigi.getEngine()._connector?.renderConfirmationModal(n, {
          confirm: () => {
            (this.clearDirtyState(e), t());
          },
          dismiss: () => {
            r();
          }
        });
      });
    }
    shouldShowUnsavedChangesModal(e) {
      return e ? (this.unsavedChanges.dirtySet?.has(e) ?? !1) : this.readDirtyStatus();
    }
  },
  W = new (class {
    services = /* @__PURE__ */ new Map();
    register(e, t, n = !0) {
      this.services.set(e, {
        factory: t,
        singleton: n
      });
    }
    get(e) {
      let t = this.services.get(e);
      if (!t) throw Error(`Service '${e}' is not registered.`);
      return t.singleton ? ((t.instance ||= t.factory()), t.instance) : t.factory();
    }
  })(),
  _i = class {
    luigi;
    _modalStack = [];
    modalSettings = {};
    constructor(e) {
      this.luigi = e;
    }
    async closeModals() {
      if (this._modalStack.length === 0) return;
      let e = [...this._modalStack];
      for (let { onInternalClose: t } of e)
        try {
          typeof t == 'function' && t();
        } catch (e) {
          console.warn('onInternalClose threw an error', e);
        }
      this.clearModalStack();
    }
    registerModal(e) {
      e && this._modalStack.push(e);
    }
    getModalSettings() {
      return (this._modalStack.length > 0 && this._modalStack[0].modalsettings) || {};
    }
    getModalStackLength() {
      return this._modalStack.length;
    }
    updateFirstModalSettings(e) {
      if (this._modalStack.length > 0) {
        let t = this._modalStack[0];
        t.modalsettings = {
          ...t.modalsettings,
          ...e
        };
      }
    }
    clearModalStack() {
      this._modalStack = [];
    }
    removeLastModalFromStack() {
      (G.modalContainer.pop(), this._modalStack.pop());
    }
    async closeModalsWithDirtyCheck() {
      let e = W.get(gi);
      for (let t of G.modalContainer)
        if (e.shouldShowUnsavedChangesModal(t))
          try {
            await e.getUnsavedChangesModalPromise(t);
          } catch {
            return !1;
          }
      return (await this.closeModals(), !0);
    }
  },
  vi = class {
    dataManagement;
    navPath;
    constructor() {
      this.dataManagement = /* @__PURE__ */ new Map();
    }
    setChildren(e, t) {
      (this.dataManagement.set(e, t), (this.navPath = ''));
    }
    getChildren(e) {
      return e ? this.dataManagement.get(e) : {};
    }
    hasChildren(e) {
      let t = this.getChildren(e);
      return !!(t && Object.prototype.hasOwnProperty.call(t, 'children'));
    }
    setRootNode(e) {
      this.dataManagement.set('_luigiRootNode', { node: e });
    }
    getRootNode() {
      return this.dataManagement.get('_luigiRootNode');
    }
    hasRootNode() {
      return !!this.getRootNode();
    }
    deleteCache() {
      this.dataManagement.clear();
    }
    deleteNodesRecursively(e) {
      if (this.hasChildren(e)) {
        let t = this.getChildren(e).children;
        for (let e = 0; e < t.length; e++) this.deleteNodesRecursively(t[e]);
      }
      this.dataManagement.delete(e);
    }
  },
  yi = class {
    luigi;
    modalService;
    nodeDataManagementService;
    previousBreadcrumbs = {};
    constructor(e) {
      this.luigi = e;
    }
    getModalService() {
      return ((this.modalService ||= W.get(_i)), this.modalService);
    }
    getNodeDataManagementService() {
      return ((this.nodeDataManagementService ||= W.get(vi)), this.nodeDataManagementService);
    }
    async getPathData(e) {
      let t = this.luigi.getConfig(),
        n = e.split('/');
      n?.length > 0 && n[0] === '' && (n = n.slice(1));
      let r = t.navigation?.globalContext || {},
        i;
      if (this.getNodeDataManagementService().hasRootNode()) i = this.getNodeDataManagementService().getRootNode().node;
      else {
        let e = await this.luigi.getConfigValueAsync('navigation.nodes');
        (typeof e == 'object' && !Array.isArray(e)
          ? ((i = e),
            i.pathSegment &&
              ((i.pathSegment = ''),
              console.warn('Root node must have an empty path segment. Provided path segment will be ignored.')))
          : (i = { children: e }),
          (i.children = await this.getChildren(i, r)),
          (i.children = this.prepareRootNodes(i.children || [], r)),
          this.getNodeDataManagementService().setRootNode(i));
      }
      let a = {
          parentNavigationContexts: [],
          ...(r || {}),
          ...(i.context || {})
        },
        o = {},
        s = {
          context: a,
          selectedNodeChildren: i.children,
          nodesInPath: [i],
          rootNodes: i.children,
          pathParams: o,
          matchedPath: ''
        };
      if (i.viewUrl && n.length === 0) s.selectedNode = i;
      else
        for (let e of n)
          if (s.selectedNodeChildren) {
            let t = this.findMatchingNode(e, s.selectedNodeChildren || []);
            if (!t) {
              console.warn('No matching node found for segment:', e);
              break;
            }
            '_rawContext' in t || (t._rawContext = t.context);
            let n = t._rawContext ?? {},
              i = H.mergeContext(r, n, t.navigationContext),
              a = i;
            if (
              (t.pathSegment?.startsWith(':') &&
                ((o[t.pathSegment.replace(':', '')] = fi.sanitizeParam(e)),
                (a = U.substituteDynamicParamsInObject(i, o))),
              (r = a),
              (t.context = a),
              (s.selectedNode = t),
              s.selectedNode && s.nodesInPath?.push(s.selectedNode),
              t.virtualTree || t._virtualTree)
            ) {
              let n = this.buildVirtualTree(t, e, o);
              n && n.length > 0 && (t.children = n);
            }
            s.selectedNodeChildren = await this.getChildren(t, r);
          }
      let c = s.nodesInPath?.filter((e) => e.pathSegment).map((e) => e.pathSegment) || [];
      return ((s.matchedPath = n.filter((e, t) => (c[t] && c[t].startsWith(':')) || c[t] === e).join('/') || ''), s);
    }
    findMatchingNode(e, t) {
      let n,
        r = t.filter((e) => !!e.pathSegment).length,
        i = t.filter((e) => e.pathSegment && e.pathSegment.startsWith(':')).length;
      if (
        r > 1 &&
        (i === 1 &&
          (console.warn(
            'Invalid node setup detected. \nStatic and dynamic nodes cannot be used together on the same level. Static node gets cleaned up. \nRemove the static node from the configuration to resolve this warning. \nAffected pathSegment:',
            e,
            'Children:',
            t
          ),
          (t = t.filter((e) => e.pathSegment && e.pathSegment.startsWith(':')))),
        i > 1)
      ) {
        console.error(
          'Invalid node setup detected. \nMultiple dynamic nodes are not allowed on the same level. Stopped navigation. \nInvalid Children:',
          t
        );
        return;
      }
      return (
        t.some((t) => {
          if (t.pathSegment === e || (t.pathSegment && t.pathSegment.startsWith(':'))) return ((n = t), !0);
        }),
        n
      );
    }
    async buildNavItems(e, t, n) {
      let r = {},
        i = [],
        a = [],
        o = [];
      for (let s of e) {
        if (
          !H.isNodeAccessPermitted(s, this.getParentNode(n.selectedNode, n), n?.selectedNode?.context || {}, this.luigi)
        )
          continue;
        let e = !!s.badgeCounter,
          c = s.externalLink ? { ...s.externalLink } : void 0,
          l = U.getNodeHref(s, n?.pathParams, this.luigi),
          u = 0;
        if ((s.badgeCounter && (u = await s.badgeCounter.count()), c?.url)) {
          let e = { ...s };
          t?.context &&
            (e.context = {
              ...e.context,
              ...t.context
            });
          let r = {
              ...e,
              viewUrl: c.url
            },
            i = n?.pathParams ? n.pathParams : {};
          ((c.url = U.substituteViewUrl(r, i, void 0, this.luigi)), (l = c.url));
        }
        let d = s.category && (typeof s.category == 'string' || s.category.id || s.category.label);
        if (d) {
          let n = s.category.id || s.category.label || s.category,
            a = this.luigi.i18n().getTranslation(s.category.label || s.category.id || s.category),
            o = r[n];
          if (!o)
            ((o = {
              badgeCounter: e
                ? {
                    count: () => Number(u),
                    label: ''
                  }
                : void 0,
              category: {
                altText: s.category.altText || '',
                icon: s.category.icon,
                id: n,
                label: a,
                nodes: [],
                tooltip: this.resolveTooltipText(s.category, a)
              }
            }),
              (r[n] = o),
              i.push(o));
          else if (e)
            if (o.badgeCounter) {
              let e = await o.badgeCounter.count();
              o.badgeCounter.count = () => Number(e + u);
            } else
              o.badgeCounter = {
                count: () => Number(u),
                label: ''
              };
          o.category?.nodes?.push({
            altText: s.altText,
            externalLink: c,
            href: l,
            icon: s.icon,
            label: s.label ? U.resolveNodeLabel(s, this.luigi) : void 0,
            node: s,
            selected: s === t,
            tooltip: s.label ? this.resolveTooltipText(s, s.label) : void 0
          });
        } else {
          let e = {
            altText: s.altText,
            badgeCounter: s.badgeCounter,
            externalLink: c,
            href: l,
            icon: s.icon,
            label: s.label ? U.resolveNodeLabel(s, this.luigi) : void 0,
            node: s,
            selected: s === t,
            tooltip: s.label ? this.resolveTooltipText(s, s.label) : void 0
          };
          s.category && !d ? a.push(e) : i.push(e);
        }
        u && o.push(u);
      }
      let s = o?.length ? o.reduce((e, t) => e + t) : 0,
        c = {
          count: () => s,
          label: ''
        };
      return (
        i.unshift(...a),
        {
          items: i,
          totalBadgeNode: c
        }
      );
    }
    async getCurrentNode(e) {
      let t = await this.getPathData(e),
        n = t.selectedNode;
      if (
        (!n && t.nodesInPath?.length === 1 && (n = t.nodesInPath[0]),
        !(
          !n ||
          !H.isNodeAccessPermitted(n, this.getParentNode(t.selectedNode, t), t?.selectedNode?.context || {}, this.luigi)
        ))
      )
        return n;
    }
    async getPathParams(e) {
      return (await this.getPathData(e)).pathParams;
    }
    getTruncatedChildren(e) {
      let t = !1,
        n = !1,
        r = [];
      return (
        e
          .slice()
          .reverse()
          .forEach((e) => {
            ((!t || e.tabNav) &&
              (e.tabNav === !1 && (n = !0),
              e.keepSelectedForChildren === !1
                ? (t = !0)
                : (e.keepSelectedForChildren || (e.tabNav && !n)) && ((t = !0), (r = []))),
              r.push(e));
          }),
        r.reverse()
      );
    }
    applyNavGroups(e) {
      let t = {},
        n = [],
        r = [];
      return (
        e.forEach((e) => {
          if (e.node) r.push(e);
          else if (e.category) {
            let i = e.category.id;
            i && i.indexOf('::') > 0 ? n.push(e) : (e.category.isGroup, (t[i] = e), r.push(e));
          }
        }),
        n.forEach((e) => {
          let n = t[e.category?.id.split('::')[0] || ''];
          n &&
            n.category &&
            (n.category.isGroup || (n.category.isGroup = !0),
            n.category.nodes || (n.category.nodes = []),
            n.category.nodes.push(e));
        }),
        r.filter((e) => {
          if (e.category?.isGroup && e.category?.nodes && e.category?.nodes.length > 0) {
            for (let t = 0; t < e.category?.nodes.length; t++) {
              let n = e.category?.nodes[t];
              if (
                (n.node && !n.node.hideFromNav && n.node.label) ||
                (n.category?.nodes && n.category.nodes.filter((e) => !e.node?.hideFromNav && e.node?.label).length > 0)
              )
                return !0;
            }
            return !1;
          }
          return !0;
        })
      );
    }
    async getLeftNavData(e, t) {
      let n = t ?? (await this.getPathData(e));
      if (e === '' && n?.nodesInPath?.[0].viewUrl)
        return {
          items: [],
          basePath: '',
          selectedNode: {},
          navClick: void 0
        };
      let r = [],
        i = [],
        a = '';
      n.nodesInPath?.forEach((e) => {
        e.children && (e.tabNav || (a += '/' + (e.pathSegment || '')), i.push(e));
      });
      let o = this.getTruncatedChildren(n.nodesInPath ?? []),
        s = [...o].pop(),
        c = n.selectedNode;
      (s?.keepSelectedForChildren || s?.tabNav) && ((c = s), o.pop(), (s = [...o].pop()));
      let l,
        u = c;
      c
        ? n.rootNodes.includes(c)
          ? ((l = c), (u = void 0))
          : (l = c.tabNav || c.keepSelectedForChildren ? s : [...i].pop())
        : ((l = [...i].pop()), (u = void 0));
      let d = (await this.getChildren(l, l?.context || {})) || [],
        f = await this.buildNavItems(d, u, n);
      return (
        (r = f.items),
        (r = this.applyNavGroups(r)),
        {
          selectedNode: c || {},
          items: r,
          basePath: a.replace(/\/\/+/g, '/'),
          sideNavFooterText: this.luigi.getConfig().settings?.sideNavFooterText,
          totalBadgeNode: f.totalBadgeNode,
          navClick: (e) => (e.node ? this.navItemClick(e.node, n) : Promise.resolve())
        }
      );
    }
    async navItemClick(e, t) {
      if (e.openNodeInModal) {
        let n = a.replaceVars(U.getNodePath(e), t?.pathParams || {}, ':', !1);
        this.luigi.navigation().openAsModal(n, e.openNodeInModal === !0 ? {} : e.openNodeInModal);
        return;
      }
      let n = t?.pathParams ? t.pathParams : {};
      if ((await W.get(gi).getUnsavedChangesModalPromise(), e.externalLink?.url)) {
        let r = { ...e };
        t?.selectedNode?.context &&
          (r.context = {
            ...r.context,
            ...t.selectedNode.context
          });
        let i = { ...r.externalLink },
          a = {
            ...r,
            viewUrl: i.url
          };
        ((i.url = U.substituteViewUrl(a, n, void 0, this.luigi)), H.openExternalLink(i, n));
        return;
      }
      if (e.link) {
        if (e.link.startsWith('/')) return this.luigi.navigation().navigate(e.link);
        let t = `${e.parent ? U.getNodePath(e.parent) : ''}/${e.link}`.replace(/\/\/+/g, '/');
        return this.luigi.navigation().navigate(t);
      }
      let r = U.getNodePath(e);
      if (((r = a.replaceVars(r, n, ':', !1)), !r && r !== '')) {
        console.error(
          'Navigation error: could not build path for the node. Check if pathSegment is defined for all nodes in the path and if there are no duplicate pathSegments on the same level.'
        );
        return;
      }
      return this.luigi.navigation().navigate(r);
    }
    async getTopNavData(e, t) {
      let n = this.luigi.getConfig(),
        r = t ?? (await this.getPathData(e)),
        i = n.navigation?.profile?.items?.length ? JSON.parse(JSON.stringify(n.navigation.profile.items)) : [],
        a = n.navigation?.appSwitcher && this.getAppSwitcherData(n.navigation?.appSwitcher, n.settings?.header),
        o = H.updateHeaderTitle(a, r);
      i?.length &&
        i.forEach((e) => {
          ((e.label = this.luigi.i18n().getTranslation(e.label || '')),
            e.children?.length &&
              e.children.forEach((e) => {
                e.label = this.luigi.i18n().getTranslation(e.label || '');
              }));
        });
      let s = this.luigi.i18n().getTranslation(n.navigation?.profile?.logout?.label) || hi.logout.label,
        c = (e) => {
          e.openNodeInModal && !e.externalLink?.url
            ? this.luigi.navigation().openAsModal(e.link || '', e.openNodeInModal === !0 ? {} : e.openNodeInModal)
            : e.link
              ? this.luigi.navigation().navigate(e.link)
              : e.externalLink?.url && H.openExternalLink(e.externalLink);
        },
        l = n.userSettings,
        d = {};
      l &&
        (d = {
          ...hi.userSettingsProfileMenuEntry,
          ...n.userSettings?.userSettingsProfileMenuEntry
        });
      let f = {
          authEnabled: this.luigi.auth().isAuthorizationEnabled(),
          signedIn: this.luigi.auth().isAuthorizationEnabled() && u.isLoggedIn(),
          items: i,
          itemClick: c,
          logout: {
            altText: this.luigi.i18n().getTranslation(n.navigation?.profile?.logout?.altText) || hi.logout.label,
            label: s,
            icon: n.navigation?.profile?.logout?.icon || hi.logout.icon,
            testId: n.navigation?.profile?.logout?.testId || H.prepareForTests(s),
            doLogout: () => {
              ki.logout();
            }
          },
          settings: {
            ...d,
            openUserSettings: () => {
              this.luigi.ux().openUserSettings();
            }
          },
          onUserInfoUpdate: (e) => {
            this.luigi.getConfigValueAsync('navigation.profile.staticUserInfoFn').then((t) => {
              t
                ? e(t)
                : ki.getUserInfoStore().subscribe((t) => {
                    e(t);
                  });
            });
          }
        },
        p = n?.globalSearch,
        m = r.selectedNode,
        h = m && r.rootNodes.includes(m) ? m : void 0,
        g = await this.buildContextSwitcher(),
        _ = {
          ...n.navigation?.productSwitcher,
          productSwitcherItemClick: (e) => {
            e.externalLink?.url
              ? H.openExternalLink(e.externalLink)
              : e.link && this.luigi.navigation().navigate(e.link);
          }
        },
        v = await this.buildNavItems(r.rootNodes, h, r),
        y = p;
      return (
        p?.searchProvider?.inputPlaceholder &&
          (y = {
            ...y,
            searchProvider: {
              ...y?.searchProvider,
              inputPlaceholder: mi.getSearchPlaceholder(this.luigi)
            }
          }),
        p?.searchFieldCentered &&
          (y = {
            ...y,
            searchFieldCentered: !!this.luigi.getConfigValue('settings.experimental.globalSearchCentered')
          }),
        {
          appTitle: o || n.settings?.header?.title,
          globalSearch: y,
          isHeaderDisabled: !!n.settings?.header?.disabled,
          logo: n.settings?.header?.logo,
          topNodes: v.items,
          totalBadgeNode: v.totalBadgeNode,
          contextSwitcher: g,
          productSwitcher: _,
          profile: this.luigi.auth().isAuthorizationEnabled() || n.navigation?.profile ? f : void 0,
          appSwitcher:
            n.navigation?.appSwitcher && this.getAppSwitcherData(n.navigation?.appSwitcher, n.settings?.header),
          navClick: (e) => (e.node ? this.navItemClick(e.node, r) : Promise.resolve())
        }
      );
    }
    getParentNode(e, t) {
      if (e && e === t.nodesInPath?.[t.nodesInPath.length - 1]) return t.nodesInPath[t.nodesInPath.length - 2];
    }
    getAppSwitcherData(e, t) {
      let n = e,
        r = n?.showMainAppEntry;
      if (n && n.items && r) {
        let e = {
          title: this.luigi.i18n().getTranslation(t.title || ''),
          subTitle: t.subTitle,
          link: '/'
        };
        if (
          (n.items?.map((e) => ({
            ...e,
            title: this.luigi.i18n().getTranslation(e.title || '')
          })),
          n.items.some((t) => t.link === e.link))
        )
          return n;
        n.items.unshift(e);
      }
      return n;
    }
    async getTabNavData(e, t) {
      let n = t ?? (await this.getPathData(e));
      if (e === '' && n?.nodesInPath?.[0].viewUrl) return {};
      let r = n?.selectedNode,
        i;
      if (!r || (!r.tabNav && ((i = this.getParentNode(r, n)), i && !i.tabNav))) return {};
      let a = i || r,
        o = this.getTabNavConfig(a);
      o &&
        !('hideTabNavAutomatically' in o) &&
        !o.showAsTabHeader &&
        console.warn('tabNav:{hideTabNavAutomatically:true|false} is not configured correctly.');
      let s = '';
      n.nodesInPath?.forEach((e) => {
        e.children && (s += '/' + (e.pathSegment || ''));
      });
      let c = i ? this.getTruncatedChildren(i.children ?? []) : this.getTruncatedChildren(r.children ?? []);
      if (o?.hideTabNavAutomatically && c.length <= 1) return {};
      let l = await this.buildNavItems(c, r, n),
        u = {
          selectedNode: r,
          items: l.items,
          totalBadgeNode: l.totalBadgeNode,
          basePath: s.replace(/\/\/+/g, '/'),
          overflowLabel: this.luigi.i18n().getTranslation('luigi.navigation.tabNav.more'),
          navClick: (e) => (e.node ? this.navItemClick(e.node, n) : Promise.resolve())
        };
      return (
        o?.showAsTabHeader &&
          a.webcomponent &&
          a.viewUrl &&
          (u.headerNode = {
            viewUrl: a.viewUrl,
            context: n.context || a.context,
            webcomponent: a.webcomponent
          }),
        u
      );
    }
    getTabNavConfig(e) {
      if (e.tabNav && typeof e.tabNav == 'object') return e.tabNav;
    }
    async getBreadcrumbData(e, t, n) {
      let r = this.luigi.getConfigValue('navigation.breadcrumbs'),
        i = t ?? (await this.getPathData(e)),
        a = i?.nodesInPath || [],
        o = [],
        s = !!r,
        c = '';
      if (!r || (e === '' && a?.[0].viewUrl)) return ((this.previousBreadcrumbs = {}), {});
      if (
        (a.forEach((e) => {
          (e.children && (c += '/' + (e.pathSegment || '')),
            e.showBreadcrumbs === !1 ? (s = !1) : e.showBreadcrumbs === !0 && (s = !0));
        }),
        !s)
      )
        return { clearBeforeRender: !0 };
      let l = this.luigi.getConfigValue('routing.useHashRouting'),
        u = U.getCurrentPath(this.luigi, l),
        d = r.omitRoot ? 2 : 1;
      for (let e = d; e < a.length; e++) {
        let t = a[e],
          n = U.mapPathToNode(u.path, t);
        if (n && this.previousBreadcrumbs[n]) o.push(this.previousBreadcrumbs[n]);
        else if (t.label || t.pathSegment || t.titleResolver)
          if (t.titleResolver)
            o.push({
              label:
                t.titleResolver.prerenderFallback && t.titleResolver.fallbackTitle
                  ? this.luigi.i18n().getTranslation(t.titleResolver.fallbackTitle)
                  : r.pendingItemLabel || '',
              node: t,
              route: n,
              pending: !0
            });
          else {
            let e = await U.getNodeLabel(t, this.luigi);
            e &&
              o.push({
                label: e,
                node: t,
                route: n
              });
          }
      }
      let f = o.some((e) => e.pending),
        p = (e) => ({
          basePath: c.replace(/\/\/+/g, '/'),
          clearBeforeRender: r.clearBeforeRender,
          items: e,
          renderer: r.renderer,
          selectedNode: i?.selectedNode || {}
        });
      if (f && n) return (this.resolveBreadcrumbTitles(a, d, u, l, r, p, n), p(o));
      if (u.path === U.getCurrentPath(this.luigi, l).path) {
        let e = {};
        (o.length > 1 ? (o[o.length - 1].last = !0) : r.autoHide && (o.length = 0),
          o.map((t) => {
            t.route && (e[t.route] = t);
          }),
          (this.previousBreadcrumbs = e));
      }
      return p(o);
    }
    async resolveBreadcrumbTitles(e, t, n, r, i, a, o) {
      let s = [];
      for (let r = t; r < e.length; r++) {
        let t = e[r],
          i = U.mapPathToNode(n.path, t);
        if (t.titleResolver)
          try {
            let e = await this.extractDataFromPath(i || ''),
              n = U.substituteDynamicParamsInObject(
                Object.assign({}, e.pathData.context, t.context),
                e.pathData.pathParams || {}
              ),
              r = await H.fetchNodeTitleData(t, n);
            s.push({
              label: r.label,
              node: t,
              route: i
            });
            continue;
          } catch {}
        let a = await U.getNodeLabel(t, this.luigi);
        a &&
          s.push({
            label: a,
            node: t,
            route: i
          });
      }
      if (n.path === U.getCurrentPath(this.luigi, r).path) {
        let e = {};
        (s.length > 1 ? (s[s.length - 1].last = !0) : i.autoHide && (s.length = 0),
          s.map((t) => {
            t.route && (e[t.route] = t);
          }),
          (this.previousBreadcrumbs = e));
      }
      o(a(s));
    }
    onNodeChange(e, t) {
      let n = this.luigi.getConfigValue('navigation.nodeChangeHook');
      a.isFunction(n) ? n(e, t) : n !== void 0 && console.warn('nodeChangeHook is not a function!');
    }
    async extractDataFromPath(e) {
      let t = await this.getPathData(e);
      return {
        nodeObject: U.getLastNodeObject(t),
        pathData: t
      };
    }
    async shouldPreventNavigation(e) {
      return !!(
        e?.onNodeActivation &&
        (a.isFunction(e.onNodeActivation) || a.isAsyncFunction(e.onNodeActivation)) &&
        (await e.onNodeActivation(e)) === !1
      );
    }
    async shouldPreventNavigationForPath(e) {
      let { nodeObject: t } = await this.extractDataFromPath(e);
      return !!(await this.shouldPreventNavigation(t));
    }
    async openViewInNewTab(e) {
      if (await this.shouldPreventNavigationForPath(e)) return;
      this.luigi.getConfigValue('routing.useHashRouting') && (e = '#' + e);
      let t;
      try {
        if (((t = new URL(e, window.location.origin)), t.origin !== window.location.origin)) return;
      } catch {
        return;
      }
      window.open(t.toString(), '_blank', 'noopener,noreferrer');
    }
    resolveTooltipText(e, t) {
      return H.generateTooltipText(e, t, this.luigi);
    }
    prepareRootNodes(e, t) {
      let n = e;
      return (
        n.length &&
          n.forEach((e) => {
            e.isRootNode = !0;
          }),
        n
      );
    }
    getAccessibleNodes(e, t, n) {
      return t ? t.filter((t) => H.isNodeAccessPermitted(t, e, n, this.luigi)) : [];
    }
    async handleNavigationRequest(e, t) {
      let {
          path: n,
          intent: r,
          preserveView: i,
          drawerSettings: o,
          modalSettings: s,
          newTab: c,
          withoutSync: l,
          preventContextUpdate: u,
          preventHistoryEntry: d,
          options: f
        } = e,
        p = this.luigi.getConfig().routing?.useHashRouting,
        m = !!(o || s),
        h = f?.nodeParams,
        g = m
          ? {
              ...f,
              nodeParams: {}
            }
          : f,
        _ = await this.buildPath(n, g || {});
      if (await this.shouldPreventNavigationForPath(n)) return;
      if (!m) {
        let e = W.get(gi);
        try {
          await e.getUnsavedChangesModalPromise();
        } catch {
          return;
        }
      }
      if (r) {
        let e = U.getIntentPath(n.replace('#', ''), this.luigi);
        if (!e) return;
        if (typeof e == 'string') _ = e;
        else if (a.isObject(e)) {
          U.handleExternalIntentPath(e);
          return;
        }
      }
      let v = _.replace(/\/\/+/g, '/'),
        y = d ? 'replaceState' : 'pushState',
        { path: b, query: x } = U.getCurrentPath(this.luigi, p),
        S = b + (x ? '?' + x : '');
      if (!(!(o || s) && a.trimLeadingSlash(S) === a.trimLeadingSlash(v)))
        if (o || s)
          if (o) (h && Object.keys(h).length > 0 && (o.nodeParams = h), this.luigi.navigation().openAsDrawer(v, o, t));
          else {
            if (!s.keepPrevious && !(await this.getModalService().closeModalsWithDirtyCheck())) return;
            (h && Object.keys(h).length > 0 && (s.nodeParams = h), this.luigi.navigation().openAsModal(v, s, t));
          }
        else {
          let e = {
              detail: {
                preventContextUpdate: !!u,
                preventHistoryEntry: !!d,
                withoutSync: !!l
              }
            },
            t = W.get(gi);
          if (G.drawerContainer && t.shouldShowUnsavedChangesModal(G.drawerContainer))
            try {
              await t.getUnsavedChangesModalPromise(G.drawerContainer);
            } catch {
              return;
            }
          if (!(await W.get(_i).closeModalsWithDirtyCheck())) return;
          if (c) {
            await this.openViewInNewTab(v);
            return;
          }
          let n = this.luigi.getConfigValue('routing.disableBrowserHistory') ? 'replaceState' : y;
          if (p) {
            let t = a.addLeadingSlash(v);
            if (!l && !u && n !== 'replaceState') location.hash = t;
            else {
              let r = new CustomEvent('hashchange', e);
              (window.history[n]({ path: '/#' + t }, '', '/#' + t), window.dispatchEvent(r));
            }
          } else {
            let t = new CustomEvent('popstate', e);
            (window.history[n]({ path: v }, '', v), window.dispatchEvent(t));
          }
        }
    }
    async getChildren(e, t = {}) {
      let n = W.get(vi);
      if (!e) return [];
      let r = [];
      if (n.hasChildren(e)) {
        let t = n.getChildren(e);
        t && (r = t.children);
      } else
        try {
          ((r = await o.getConfigValueFromObjectAsync(e, 'children', t || e.context)),
            (r ??= []),
            (r = r.map((e) => this.getExpandStructuralPathSegment(e)).map((t) => this.bindChildToParent(t, e)) || []));
        } catch (e) {
          console.error('Could not lazy-load children for node', e);
        }
      let i = this.getAccessibleNodes(e, r, t);
      return (
        n.setChildren(e, {
          children: r,
          filteredChildren: i
        }),
        i
      );
    }
    getExpandStructuralPathSegment(e) {
      if (e && e.pathSegment && e.pathSegment.indexOf('/') !== -1) {
        let t = e.pathSegment.split('/'),
          n = { ...e },
          r = (e, t) => {
            let i = e.shift(),
              a = {};
            return (
              e.length
                ? ((a.pathSegment = i), t.hideFromNav && (a.hideFromNav = t.hideFromNav), (a.children = [r(e, t)]))
                : ((a = n), (a.pathSegment = i)),
              a
            );
          };
        return r(t, e);
      }
      return e;
    }
    bindChildToParent(e, t) {
      return (t && t.pathSegment && (e.parent = t), e);
    }
    buildVirtualTree(e, t, n) {
      let r = e.virtualTree,
        i = e._virtualTree,
        o = e._virtualViewUrl || e.viewUrl;
      if ((r || i) && t) {
        let t = typeof e._virtualPathIndex == 'number' ? e._virtualPathIndex : void 0;
        if ((r && ((t = void 0), (e.keepSelectedForChildren = !0)), typeof t == 'number' && t > 50)) return;
        let i = (t ?? 0) + 1;
        if (i > 50) return;
        let s = a.removeProperties(e, [
          '_*',
          'virtualTree',
          'parent',
          'children',
          'keepSelectedForChildren',
          'navigationContext'
        ]);
        Object.assign(s, {
          pathSegment: ':virtualSegment_' + i,
          label: ':virtualSegment_' + i,
          viewUrl: a.trimTrailingSlash(this.buildVirtualViewUrl(o || '', n, i)),
          _virtualTree: !0,
          _virtualPathIndex: i,
          _virtualViewUrl: o
        });
        let c = Array.isArray(e.children) && e.children.length > 0 ? e.children[0]._virtualTree : !1;
        return (
          e.children &&
            !c &&
            console.warn(
              'Found both virtualTree and children nodes defined on a navigation node. \nChildren nodes are redundant and ignored when virtualTree is enabled. \nPlease refer to documentation'
            ),
          [s]
        );
      }
    }
    buildVirtualViewUrl(e, t, n) {
      let r = '';
      for (let e in t) e.startsWith('virtualSegment') && (r += ':' + e + '/');
      if (!n) return e;
      r += ':virtualSegment_' + n + '/';
      let i = e;
      i = e.includes('{virtualTreePath}') ? e.replace('{virtualTreePath}', r) : e + '/' + r;
      try {
        if (new URL(i, 'http://dummy-base').origin === new URL(e, 'http://dummy-base').origin) return i;
      } catch (e) {
        console.error('Error building virtual view URL -- make sure virtualTreePath is not part of origin.', e);
      }
      return e;
    }
    async buildPath(e, t) {
      let {
          fromVirtualTreeRoot: n,
          fromContext: r,
          fromClosestContext: i,
          fromParent: a,
          relative: o,
          nodeParams: s
        } = t,
        c = this.luigi.getConfigValue('routing.useHashRouting'),
        { path: l, query: u } = U.getCurrentPath(this.luigi, c),
        d = l + (u ? '?' + u : ''),
        f = await this.getPathData(d),
        p = f.nodesInPath,
        m = e;
      if (p === void 0) return (console.warn('No nodes in path found for current path:', d), m);
      if (n) {
        m = '';
        let t = [...p]
          .map((e, t) => (e.virtualTree ? t : -1))
          .filter((e) => e !== -1)
          .pop();
        (p.forEach((e, n) => {
          e.pathSegment && (t === void 0 || n <= t) && (m += '/' + e.pathSegment);
        }),
          (m += '/' + e));
      } else if (r) {
        let t = r,
          n = [...p].reverse().find((e) => t === e.navigationContext);
        m = U.concatenatePath(U.getSubPath(n, f.pathParams), e);
      } else if (i) {
        let t = [...p].reverse().find((e) => e.navigationContext && e.navigationContext.length > 0);
        m = U.concatenatePath(U.getSubPath(t, f.pathParams), e);
      } else
        a
          ? (m = U.concatenatePath(U.getSubPath(f.selectedNode?.parent, f.pathParams), e))
          : o && (m = U.concatenatePath(U.getSubPath(f.selectedNode, f.pathParams), e));
      return (
        s &&
          Object.keys(s).length > 0 &&
          ((m += m.includes('?') ? '&' : '?'),
          Object.entries(s).forEach((e, t) => {
            m +=
              encodeURIComponent(U.getContentViewParamPrefix(this.luigi) + e[0]) +
              '=' +
              encodeURIComponent(e[1]) +
              (t < Object.keys(s).length - 1 ? '&' : '');
          })),
        m
      );
    }
    async getCurrentRoutePath(e) {
      let { fromVirtualTreeRoot: t, fromContext: n, fromClosestContext: r, fromParent: i } = e,
        a = this.luigi.getConfigValue('routing.useHashRouting'),
        { path: o, query: s } = U.getCurrentPath(this.luigi, a),
        c = o + (s ? '?' + s : ''),
        l = await this.getPathData(c),
        u = l.nodesInPath;
      if (!u || !l.selectedNode) return '';
      let d = U.getSubPath(l.selectedNode, l.pathParams);
      if (t) {
        let e = [...u].reverse().find((e) => e.virtualTree);
        if (!e) {
          console.error(
            'LuigiClient Error: fromVirtualTreeRoot() is not possible because you are not inside a Luigi virtualTree navigation node.'
          );
          return;
        }
        let t = U.getSubPath(e, l.pathParams);
        return d.split(t).join('');
      } else if (i) {
        let e = U.getSubPath(l.selectedNode.parent, l.pathParams);
        return d.split(e).join('');
      } else if (r) {
        let e = [...u].reverse().find((e) => e.navigationContext && e.navigationContext.length > 0),
          t = U.getSubPath(e, l.pathParams);
        return d.split(t).join('');
      } else if (n) {
        let e = [...u].reverse().find((e) => n === e.navigationContext),
          t = U.getSubPath(e, l.pathParams);
        return d.split(t).join('');
      }
      return d;
    }
    async buildContextSwitcher() {
      let e = this.luigi.getConfigValue('navigation.contextSwitcher');
      if (!e) return;
      pi.resetFallbackLabelCache();
      let t = await this.luigi.getConfigValueAsync('navigation.contextSwitcher.actions'),
        n = await pi.fetchOptions(this.luigi),
        r = this.luigi.getConfig().routing?.useHashRouting,
        i = U.getCurrentPath(this.luigi, r),
        a = e.parentNodePath,
        o = e.fallbackLabelResolver,
        s = await pi.getSelectedLabel(i?.path, n, a, o, this.luigi),
        c = pi.getSelectedNode(i?.path, n, a),
        l = pi.getSelectedOption(i?.path, n, a),
        u = (e, n) => {
          if (!(!e || typeof e != 'string'))
            if (n === 'action') {
              let n = t.find((t) => t.link === e);
              if (n?.clickHandler && !n.clickHandler(n)) return;
              this.luigi.navigation().navigate(e);
            } else this.luigi.navigation().navigate(e);
        };
      if (
        (e?.preserveSubPathOnSwitch &&
          n?.length &&
          l &&
          n.forEach((e) => {
            ((e.linkFromPath = pi.getNodePathFromCurrentPath(e, l, this.luigi)),
              e.link === l.link && (l.linkFromPath = e.linkFromPath));
          }),
        !l && t?.length)
      ) {
        let e = t?.find((e) => e.link === `/${i?.path}`);
        e && ((s = e.label), (c = e.link), (l = e));
      }
      return {
        actions: t,
        config: e,
        options: n,
        selectedLabel: s,
        selectedNodePath: c,
        selectedOption: l,
        switcherChange: (e, t) => u(e, t)
      };
    }
  },
  bi = class {
    luigi;
    preloadBatchSize = 1;
    shouldPreload = !1;
    constructor(e) {
      this.luigi = e;
    }
    preloadViewGroups(e = 3, t) {
      let n = this.luigi.getConfigValue('navigation.preloadViewGroups'),
        r = this.luigi.getConfigValue('navigation.viewGroupSettings'),
        i = this.luigi.getEngine()._connector?.getContainerWrapper();
      if (n === !1 || !r || !i) return;
      let a = Date.now();
      if (this.getPreloadingContainers(i).filter((e) => a - (e._luigiPreloadCreatedAt || 0) < 3e4).length > 0) {
        console.log('skipping view group preloading (busy)');
        return;
      }
      let o = [...i.childNodes].filter((e) => e.tagName?.startsWith('LUIGI-') && e.viewGroup).map((e) => e.viewGroup),
        s = Object.entries(r)
          .filter(([e]) => !o.includes(e))
          .filter(([e, t]) => t && t.preloadUrl);
      t
        ? s.forEach(([e, t]) => {
            t.loadOnStartup && this.preloadContainerOnBackground(t, e, i);
          })
        : s
            .filter((t, n) => n < e)
            .forEach(([e, t]) => {
              this.preloadContainerOnBackground(t, e, i);
            });
    }
    preloadContainerOnBackground(e, t, n) {
      let r = document.createElement('luigi-container');
      (r.setAttribute('lui_container', 'true'),
        (r.viewurl = e.preloadUrl),
        (r.viewGroup = t),
        (r.style.display = 'none'),
        (r._luigiPreloading = !0),
        (r._luigiPreloadCreatedAt = Date.now()),
        (r.luigiMfId = a.getRandomId()),
        this.luigi.getEngine()._comm.addListeners(r, this.luigi));
      let i = this.luigi.getConfigValue('settings.iframeCreationInterceptor');
      (a.isFunction(i) && ((r.iframeCreationInterceptor = i), (r._luigiMicroFrontendType = 'main')), n.appendChild(r));
    }
    preload(e) {
      (this.shouldPreload &&
        setTimeout(() => {
          this.preloadViewGroups(this.preloadBatchSize, !!e);
        }, +!!e),
        (this.shouldPreload = !0));
    }
    viewGroupLoaded(e) {
      if (e._luigiPreloading) {
        let t = Date.now() - (e._luigiPreloadCreatedAt || 0),
          n = 1;
        (t < 500 ? (n = 3) : t < 1e3 && (n = 2),
          (this.preloadBatchSize = n),
          setTimeout(
            () => {
              e._luigiPreloading = !1;
            },
            this.preloadBatchSize > 2 ? 500 : 1e3
          ));
      }
    }
    getPreloadingContainers(e) {
      return [...e.childNodes].filter((e) => e.tagName?.startsWith('LUIGI-') && e._luigiPreloading);
    }
  },
  xi = {
    listeners: [],
    hashChangeWithoutSync: !1,
    addEventListener(e, t) {
      (this.listeners.push({
        type: e,
        listenerFn: t
      }),
        window.addEventListener(e, t));
    },
    removeEventListener(e, t) {
      ((this.listeners = this.listeners.filter((n) => !(n.type === e && n.listenerFn === t))),
        window.removeEventListener(e, t));
    },
    removeAllEventListeners() {
      (this.listeners.forEach((e) => {
        window.removeEventListener(e.type, e.listenerFn);
      }),
        (this.listeners = []));
    }
  },
  Si = class {
    luigi;
    navigationService;
    dirtyStatusService;
    previousNode;
    currentRoute;
    modalSettings;
    previousPathData;
    constructor(e) {
      this.luigi = e;
    }
    getNavigationService() {
      return (
        this.navigationService || ((this.navigationService = W.get(yi)), (this.dirtyStatusService = W.get(gi))),
        this.navigationService
      );
    }
    shouldSkipRoutingForUrlPatterns() {
      return (
        (this.luigi.getConfigValue('routing.skipRoutingForUrlPatterns') || [/access_token=/, /id_token=/]).filter((e) =>
          location.href.match(e)
        ).length !== 0
      );
    }
    enableRouting() {
      this.luigi.getConfig().routing?.useHashRouting
        ? (xi.addEventListener('hashchange', (e) => {
            let t = !!e?.detail?.preventContextUpdate,
              n = !!e?.detail?.withoutSync;
            this.handleRouteChange(U.getCurrentPath(this.luigi, !0, !0), n, t);
          }),
          this.handleRouteChange(U.getCurrentPath(this.luigi, !0, !0)))
        : (xi.addEventListener('popstate', (e) => {
            let t = !!e?.detail?.preventContextUpdate,
              n = !!e?.detail?.withoutSync;
            this.handleRouteChange(U.getCurrentPath(this.luigi, !1, !0), n, t);
          }),
          this.handleRouteChange(U.getCurrentPath(this.luigi, !1, !0)));
    }
    async handleRouteChange(e, t = !1, n = !1) {
      let r = e.path,
        i = e.query,
        o = r + (i ? '?' + i : ''),
        s = new URLSearchParams(i),
        c = Object.create(null);
      try {
        if (this.dirtyStatusService?.shouldShowUnsavedChangesModal()) {
          let e = this.dirtyStatusService.unsavedChanges.persistUrl;
          e && history.pushState(window.state, '', e);
          return;
        }
      } catch {
        return;
      }
      if (this.shouldSkipRoutingForUrlPatterns()) return;
      (this.setFeatureToggle(o),
        await this.shouldShowModalPathInUrl(e),
        s.forEach((e, t) => {
          c[t] = e;
        }),
        this.checkInvalidateCache(this.previousPathData, r));
      let l = await this.getNavigationService().getPathData(r),
        u = U.filterNodeParams(c, this.luigi),
        d = a.getPathWithoutHash(r) || '';
      this.currentRoute = {
        raw: window.location.href,
        path: r,
        nodeParams: u
      };
      let f = l?.selectedNode ?? (await this.getNavigationService().getCurrentNode(r)),
        p = f?.viewUrl || '';
      if (
        (f && (await this.handleViewUrlMisconfigured(f, p, this.previousPathData, d))) ||
        (await this.handlePageNotFound(f, p, l, r, d))
      ) {
        let e = this.luigi.getEngine()._connector;
        (e?.renderLeftNav(await this.getNavigationService().getLeftNavData(r, l)),
          e?.renderTabNav(await this.getNavigationService().getTabNavData(r, l)));
        return;
      }
      let m = this.luigi.getEngine()._connector;
      if (
        (m?.renderTopNav(await this.getNavigationService().getTopNavData(r, l)),
        m?.renderLeftNav(await this.getNavigationService().getLeftNavData(r, l)),
        m?.renderTabNav(await this.getNavigationService().getTabNavData(r, l)),
        m?.renderBreadcrumbs(
          await this.getNavigationService().getBreadcrumbData(r, l, (e) => {
            m?.renderBreadcrumbs(e);
          })
        ),
        f)
      ) {
        let e = {
          nodeParams: u || {},
          pathParams: l?.pathParams || {},
          searchParams: U.prepareSearchParamsForClient(f, this.luigi)
        };
        ((this.currentRoute.node = f),
          this.getNavigationService().onNodeChange(this.previousNode, f),
          (this.previousNode = f),
          await G.updateMainContent(f, this.luigi, e, t, n),
          (this.previousPathData = l));
      }
    }
    getCurrentRoute() {
      return this.currentRoute;
    }
    async shouldShowModalPathInUrl(e) {
      this.luigi.getConfigValue('routing.showModalPathInUrl') && (await this.handleBookmarkableModalPath(e));
    }
    async handleBookmarkableModalPath(e) {
      let t = W.get(yi),
        n = W.get(_i),
        r = new URLSearchParams(e?.query || ''),
        i = U.getModalViewParamName(this.luigi),
        a = r.get(i);
      if (a) {
        let e = r.get(`${i}Params`);
        try {
          let n = JSON.parse(e || '{}'),
            { nodeObject: r } = await t.extractDataFromPath(a);
          document.querySelector('.lui-modal luigi-container')
            ? this.luigi.getEngine()._connector?.updateModalSettings(n)
            : this.luigi.navigation().openAsModal(a, n || r.openNodeInModal);
        } catch (e) {
          console.error('Error parsing modal settings from URL parameters', e);
        }
      } else return (await n.closeModalsWithDirtyCheck(), void 0);
    }
    appendModalDataToUrl(e, t) {
      let n = U.getHashQueryParamSeparator(),
        r = U.getQueryParams(this.luigi),
        i = U.getModalViewParamName(this.luigi),
        a = r[i],
        o = new URL(location.href),
        s = this.luigi.getConfigValue('routing.useHashRouting'),
        c = history.state,
        l,
        u;
      if (s) {
        let [e, t] = o.hash.split('?');
        ((l = e), (u = U.getURLWithoutModalData(t, i)), u && (l += '?' + u));
      } else
        ((l = o.pathname),
          (u = U.getURLWithoutModalData(o.search, i)),
          u && (l += '?' + U.getURLWithoutModalData(o.search, i)));
      if (((c = U.handleHistoryState(c, l)), a !== e)) {
        if (((r[i] = e), t && Object.keys(t).length && (r[`${i}Params`] = JSON.stringify(t)), s)) {
          let e = location.hash.indexOf(n);
          (e !== -1 && (o.hash = o.hash.slice(0, e)), (o.hash = `${o.hash}${n}${U.encodeParams(r)}`));
        } else o.search = `?${U.encodeParams(r)}`;
        history.pushState(c, '', o.href);
      } else {
        let e = new URL(o);
        (s ? ((e.hash = e.hash.split('?')[0]), u && (e.hash += '?' + u)) : (e.search = u),
          history.replaceState({}, '', e.href),
          history.pushState(c, '', o.href));
      }
    }
    removeModalDataFromUrl(e) {
      let t = U.getQueryParams(this.luigi),
        n = U.getModalViewParamName(this.luigi),
        r = new URL(location.href);
      if (this.luigi.getConfigValue('routing.useHashRouting')) {
        let e = {};
        (t[n] && (e[n] = t[n]), t[`${n}Params`] && (e[`${n}Params`] = t[`${n}Params`]));
        let i = U.encodeParams(e);
        r.hash.includes(`?${i}`)
          ? (r.hash = r.hash.replace(`?${i}`, ''))
          : r.hash.includes(`&${i}`) && (r.hash = r.hash.replace(`&${i}`, ''));
      } else {
        let e = new URLSearchParams(r.search.slice(1));
        (e.delete(n), e.delete(`${n}Params`));
        let t = '';
        (Array.from(e.keys()).forEach((n) => {
          t += (t === '' ? '?' : '&') + n + '=' + e.get(n);
        }),
          (r.search = t));
      }
      if (history.state && history.state.modalHistoryLength >= 0 && e) {
        history.state.modalHistoryLength;
        let e = history.state.pathBeforeHistory,
          t = !1;
        if (
          (window.addEventListener(
            'popstate',
            (n) => {
              t
                ? (history.replaceState({}, '', e), history.pushState({}, '', e), history.back())
                : (history.pushState({}, '', e), history.back());
            },
            { once: !0 }
          ),
          history.state.historygap === history.length - history.state.modalHistoryLength)
        )
          history.go(-history.state.modalHistoryLength);
        else if (history.state.modalHistoryLength > history.length) {
          let e = history.length - 1;
          ((t = !0), history.go(-e), (window.Luigi.preventLoadingModalData = !0));
        } else {
          let e = history.state.modalHistoryLength;
          history.go(-e);
        }
      } else history.pushState({}, '', r.href);
    }
    setFeatureToggle(e) {
      let t = this.luigi.getConfigValue('settings.featureToggles.queryStringParam'),
        n = this.luigi.featureToggles();
      t && typeof e == 'string' && U.setFeatureToggles(t, e, n);
    }
    updateModalDataInUrl(e, t, n) {
      let r = U.getHashQueryParamSeparator(),
        i = U.getQueryParams(this.luigi),
        a = U.getModalViewParamName(this.luigi);
      ((i[a] = e), t && Object.keys(t).length && (i[`${a}Params`] = JSON.stringify(t)));
      let o = new URL(location.href);
      if (this.luigi.getConfigValue('routing.useHashRouting')) {
        let e = location.hash.indexOf(r);
        (e !== -1 && (o.hash = o.hash.slice(0, e)), (o.hash = `${o.hash}${r}${U.encodeParams(i)}`));
      } else o.search = `?${U.encodeParams(i)}`;
      n ? history.pushState(window.state, '', o.href) : history.replaceState(window.state, '', o.href);
    }
    checkInvalidateCache(e, t) {
      if (!e) return;
      let n = W.get(vi),
        r = t.split('/');
      if (e.nodesInPath && e.nodesInPath.length > 0) {
        let t = e.nodesInPath.slice(1),
          i = !0;
        for (let a = 0; a < t.length; a++) {
          let o = r.length > a ? r[a] : void 0,
            s = t[a];
          if (o !== s.pathSegment || !i)
            if (U.isDynamicNode(s)) {
              if (!i || o !== U.getDynamicNodeValue(s, e.pathParams)) {
                n.deleteNodesRecursively(s);
                break;
              }
            } else i = !1;
        }
      } else n.deleteCache();
    }
    async handlePageNotFound(e, t, n, r, i) {
      let o = a.getTrimmedUrl(r),
        s = U.isExistingRoute(o, n);
      if ((!t && !e?.compound) || e?.tabNav?.showAsTabHeader) {
        let e = await U.getDefaultChildNode(n, async (e, t) => await this.getNavigationService().getChildren(e, t));
        if (s) {
          let t = a.getTrimmedUrl(r);
          return (
            this.getNavigationService().handleNavigationRequest({
              path: `${t ? `/${t}` : ''}/${e}`,
              preserveView: void 0,
              modalSettings: void 0,
              newTab: !1,
              withoutSync: !1,
              preventContextUpdate: !1,
              preventHistoryEntry: !0
            }),
            !1
          );
        } else {
          if (e && n?.nodesInPath && n.nodesInPath.length > 1)
            return (this.showPageNotFoundError(a.trimTrailingSlash(o || '') + '/' + e, i, !0), !0);
          let t = await U.getDefaultChildNode(n);
          this.showPageNotFoundError(t, i, !1);
        }
        return !0;
      }
      return s ? !1 : (this.showPageNotFoundError(n.matchedPath, i, !0), !0);
    }
    async showPageNotFoundError(e, t, n = !1) {
      let r = U.getPageNotFoundRedirectResult(t, n, this.luigi);
      if (r.ignoreLuigiErrorHandling) return;
      let i = r.path;
      if (i) {
        if (r.keepURL) {
          let e = this.luigi.getConfig().routing?.useHashRouting,
            t = U.getCurrentPath(this.luigi, e);
          ((t.path = i), this.handleRouteChange(t));
        } else this.getNavigationService().handleNavigationRequest({ path: i });
        return;
      }
      (U.showRouteNotFoundAlert(t, n, this.luigi),
        this.getNavigationService().handleNavigationRequest({ path: a.addLeadingSlash(e) }));
    }
    async handleViewUrlMisconfigured(e, t, n, r) {
      let { children: i, intendToHaveEmptyViewUrl: a, compound: o } = e,
        s = !!i?.length;
      if (!o && t.trim() === '' && !s && !a) {
        if (
          (console.warn(
            "The intended target route can't be accessed since it has neither a viewUrl nor children. This is most likely a misconfiguration."
          ),
          !(n && (n.selectedNode?.viewUrl || (n.selectedNode && n.selectedNode.compound))))
        ) {
          let e = await this.getNavigationService().getPathData('/'),
            t = await U.getDefaultChildNode(e);
          this.showPageNotFoundError(t, r, !1);
        }
        return !0;
      }
      return !1;
    }
  },
  Ci = class {
    decorators;
    constructor() {
      this.decorators = [];
    }
    hasDecorators() {
      return this.decorators.length > 0;
    }
    add(e) {
      this.decorators = this.decorators.filter((t) => t.uid !== e.uid).concat(e);
    }
    applyDecorators(e, t) {
      if (!e) return e;
      let n = new URL(a.prependOrigin(e)),
        r = this.decorators.filter((e) => e.type === 'queryString');
      for (let e = 0; e < r.length; e++) {
        let t = r[e];
        n.searchParams.has(t.key) && n.searchParams.delete(t.key);
        let i = t.valueFn();
        n.searchParams.append(t.key, i);
      }
      return (t && (n.search = decodeURIComponent(n.search)), n.href);
    }
  },
  wi = async (e, t, n, r) => {
    let i = await t.readUserSettings(),
      o = e.userSettingsGroup && typeof i == 'object' && i && e.userSettingsGroup ? i[e.userSettingsGroup] : null,
      s = n?.nodeParams || {},
      c = n?.pathParams || {},
      l = n?.searchParams || {};
    if (e.webcomponent && e.viewUrl && !U.checkWCUrl(e.viewUrl, t))
      return (console.warn(`View URL '${e.viewUrl}' not allowed to be included`), document.createElement('div'));
    if (e.compound) {
      let n = document.createElement('luigi-compound-container');
      return (
        console.log('LuigiCompoundContainer:'),
        console.log(t.i18n().getCurrentLocale()),
        console.log(t.theming().getCurrentTheme()),
        n.setAttribute('lui_container', 'true'),
        (n.viewurl = e.viewUrl
          ? W.get(Ci).applyDecorators(U.substituteViewUrl(e, c, s, t), e.decodeViewUrl ?? !1)
          : ''),
        (n.webcomponent = e.webcomponent ?? !1),
        (n.compoundConfig = e.compound),
        (n.context = e.context),
        (n.clientPermissions = e.clientPermissions ?? {}),
        (n.nodeParams = s),
        (n.pathParams = c),
        (n.userSettingsGroup = e.userSettingsGroup),
        (n.userSettings = o),
        (n.searchParams = l),
        (n.activeFeatureToggleList = t.featureToggles().getActiveFeatureToggleList()),
        (n.locale = t.i18n().getCurrentLocale()),
        (n.theme = t.theming().getCurrentTheme()),
        (n.viewGroup = e.viewGroup),
        (n.virtualTree = e.virtualTree || e._virtualTree),
        (n.virtualTreeRootNode = H.findVirtualTreeRootNode(e)),
        t.getEngine()._comm.addListeners(n, t),
        n
      );
    } else {
      let n = document.createElement('luigi-container');
      return (
        n.setAttribute('lui_container', 'true'),
        (n.viewurl = e.viewUrl
          ? W.get(Ci).applyDecorators(U.substituteViewUrl(e, c, s, t), e.decodeViewUrl ?? !1)
          : ''),
        (n.webcomponent = e.webcomponent ?? !1),
        (n.context = e.context),
        (n.authData = u.getStoredAuthData()),
        (n.clientPermissions = e.clientPermissions ?? {}),
        (n.cssVariables = await t.theming().getCSSVariables()),
        (n.nodeParams = s),
        (n.pathParams = c),
        (n.userSettingsGroup = e.userSettingsGroup),
        (n.userSettings = o),
        (n.searchParams = l),
        (n.activeFeatureToggleList = t.featureToggles().getActiveFeatureToggleList()),
        (n.locale = t.i18n().getCurrentLocale()),
        (n.theme = t.theming().getCurrentTheme()),
        (n.viewGroup = e.viewGroup),
        (n.virtualTree = e.virtualTree || e._virtualTree),
        (n.virtualTreeRootNode = H.findVirtualTreeRootNode(e)),
        Ti(n, t),
        Ei(n, t),
        Di(n, t, e, r || 'main'),
        Oi(n, t, e, r || 'main'),
        t.getEngine()._comm.addListeners(n, t),
        (n.luigiMfId = a.getRandomId()),
        n
      );
    }
  },
  Ti = (e, t) => {
    let n = t.getConfigValue('settings.customSandboxRules');
    if (!n?.length) return;
    let r = [
      'allow-forms',
      'allow-modals',
      'allow-popups',
      'allow-popups-to-escape-sandbox',
      'allow-same-origin',
      'allow-scripts'
    ];
    e.sandboxRules = n ? [...new Set([...r, ...n])] : r;
  },
  Ei = (e, t) => {
    let n = t.getConfigValue('settings.allowRules');
    n?.length &&
      (n.forEach((e, t) => {
        n[t] = e + (e.indexOf(';') == -1 ? ';' : '');
      }),
      (e.allowRules = n));
  },
  Di = (e, t, n, r) => {
    let i = t.getConfigValue('settings.iframeCreationInterceptor');
    a.isFunction(i) && ((e.iframeCreationInterceptor = i), (e._luigiCurrentNode = n), (e._luigiMicroFrontendType = r));
  },
  Oi = (e, t, n, r) => {
    let i = t.getConfigValue('settings.webcomponentCreationInterceptor');
    a.isFunction(i) &&
      ((e.webcomponentCreationInterceptor = i), (e.currentNode = n), (e._luigiMicroFrontendType = r !== 'main'));
  },
  G = {
    navService: void 0,
    routingService: void 0,
    luigi: void 0,
    modalContainer: [],
    drawerContainer: void 0,
    init: (e) => {
      ((G.navService = W.get(yi)),
        (G.routingService = W.get(Si)),
        (G.luigi = e),
        e.getEngine()._connector?.renderMainLayout());
      let t = W.get(bi);
      ((t.shouldPreload = !0), t.preload(!0), (t.shouldPreload = !1));
    },
    update: async (e) => {
      let t = G.routingService.getCurrentRoute();
      if (!t) return;
      let n = !e || e.length === 0;
      if (
        ((n || e.includes('navigation') || e.includes('navigation.nodes')) && W.get(vi).deleteCache(),
        e?.length === 1 && e[0] === 'navigation.viewgroupdata')
      ) {
        let e = await G.navService.getPathData(t.path),
          n = G.luigi.getEngine()._connector,
          [r, i, a, o] = await Promise.all([
            G.navService.getTopNavData(t.path, e),
            G.navService.getLeftNavData(t.path, e),
            G.navService.getTabNavData(t.path, e),
            G.navService.getBreadcrumbData(t.path, e, (e) => {
              n?.renderBreadcrumbs(e);
            })
          ]);
        (n?.renderTopNav(r), n?.renderLeftNav(i), n?.renderTabNav(a), n?.renderBreadcrumbs(o));
        return;
      }
      if (
        ((n ||
          e.includes('settings.header') ||
          e.includes('settings') ||
          e.includes('navigation') ||
          e.includes('navigation.badges') ||
          e.includes('navigation.profile') ||
          e.includes('navigation.contextSwitcher') ||
          e.includes('navigation.productSwitcher') ||
          e.includes('navigation.viewgroupdata')) &&
          G.luigi.getEngine()._connector?.renderTopNav(await G.navService.getTopNavData(t.path)),
        (n ||
          e.includes('navigation') ||
          e.includes('navigation.nodes') ||
          e.includes('navigation.viewgroupdata') ||
          e.includes('settings') ||
          e.includes('settings.footer')) &&
          G.luigi.getEngine()._connector?.renderLeftNav(await G.navService.getLeftNavData(t.path)),
        n ||
          e.includes('navigation') ||
          e.includes('navigation.nodes') ||
          e.includes('navigation.viewgroupdata') ||
          e.includes('settings') ||
          e.includes('settings.footer'))
      ) {
        G.luigi.getEngine()._connector?.renderTabNav(await G.navService.getTabNavData(t.path));
        let e = G.luigi.getEngine()._connector;
        e?.renderBreadcrumbs(
          await G.navService.getBreadcrumbData(t.path, void 0, (t) => {
            e?.renderBreadcrumbs(t);
          })
        );
      }
      if (n || e.includes('navigation') || e.includes('navigation.nodes')) {
        if (t.path) {
          let e = (await G.navService.getPathData(t.path))?.selectedNode ?? t.node;
          e && ((t.node = e), G.updateMainContent(e, G.luigi));
        }
      } else e.includes('settings.theming') && t.node && G.updateMainContent(t.node, G.luigi);
    },
    updateMainContent: async (e, t, n, r, i) => {
      let o = await t.readUserSettings(),
        s = e.userSettingsGroup && typeof o == 'object' && o && e.userSettingsGroup ? o[e.userSettingsGroup] : null,
        c = t.getEngine()._connector?.getContainerWrapper();
      t.getEngine()._connector?.hideLoadingIndicator(c);
      let l = n?.nodeParams || {},
        u = n?.pathParams || {},
        d = n?.searchParams || {};
      if (e && c) {
        let o, f, p;
        (e.virtualTree || e._virtualTree) && (p = H.findVirtualTreeRootNode(e));
        let m = e.viewUrl ? W.get(Ci).applyDecorators(U.substituteViewUrl(e, u, l, t), e.decodeViewUrl ?? !1) : '';
        if (
          ([...c.childNodes].forEach((n) => {
            if (n.tagName?.indexOf('LUIGI-') === 0)
              if ((r && (o = n), n.viewGroup && e.viewGroup !== n.viewGroup)) {
                if (!r) {
                  n.style.display = 'none';
                  let e = t.getConfigValue('navigation.viewGroupSettings')?.[n.viewGroup];
                  e?.preloadUrl &&
                    ((n.viewurl = e.preloadUrl), (n.context = {}), (n.nodeParams = {}), (n.pathParams = {}));
                }
              } else
                r ||
                n.viewGroup ||
                (n.virtualTree && p === n.virtualTreeRootNode) ||
                (!e.viewGroup &&
                  !e.isolateView &&
                  !e.webcomponent &&
                  n.viewurl &&
                  (i || (m && a.isSameUrl(n.viewurl, m))))
                  ? (f = n)
                  : r || n.remove();
          }),
          f && f._luigiPreloading && ((f._luigiPreloading = !1), W.get(bi).viewGroupLoaded(f)),
          f)
        ) {
          let n = f.viewurl;
          (!r &&
            !i &&
            ((f.style.display = 'block'),
            (f.viewurl = m),
            (f.nodeParams = l),
            (f.pathParams = u),
            (f.clientPermissions = e.clientPermissions),
            (f.searchParams = d),
            (f.locale = t.i18n().getCurrentLocale()),
            (f.theme = t.theming().getCurrentTheme()),
            (f.activeFeatureToggleList = t.featureToggles().getActiveFeatureToggleList()),
            (f.userSettingsGroup = e.userSettingsGroup),
            (f.userSettings = s),
            Ti(f, t),
            Ei(f, t)),
            r && !i && ((f.nodeParams = l), (f.pathParams = u), (f.searchParams = d)),
            i ||
              (a.isSameUrl(n, m) && n !== m && !f.virtualTree && !r
                ? ((f.context = e.context || {}), f.updateViewUrl(m))
                : f.updateContext(e.context || {}, { withoutSync: !!r })));
        } else if (r) !i && o && o.updateContext(e.context || {}, { withoutSync: r });
        else {
          let r = await wi(e, t, n, 'main');
          c?.appendChild(r);
          let i = t.getEngine()._connector;
          e.loadingIndicator?.enabled !== !1 && i?.showLoadingIndicator(c);
        }
      }
    },
    openModal: async (e, t, n, r, i) => {
      let a = await wi(t, e, i, 'modal');
      G.modalContainer.push(a);
      let o = W.get(Si),
        s = W.get(_i),
        c = W.get(gi),
        l = !1,
        u,
        d,
        f = new Promise((t) => {
          ((u = () => {
            l || ((l = !0), t(), s.removeLastModalFromStack());
          }),
            (d = async () => {
              try {
                await c.getUnsavedChangesModalPromise(a);
              } catch {
                return;
              }
              (u && u(),
                e.getConfigValue('routing.showModalPathInUrl') &&
                  s.getModalStackLength() === 0 &&
                  o.removeModalDataFromUrl(!0));
            }),
            a.addEventListener(V.CLOSE_CURRENT_MODAL_REQUEST, d),
            a.addEventListener(V.GO_BACK_REQUEST, async (t) => {
              try {
                await c.getUnsavedChangesModalPromise(a);
              } catch {
                return;
              }
              let n = t?.detail || t?.payload;
              if (
                (r?.(n),
                u && u(),
                e.getConfigValue('routing.showModalPathInUrl') &&
                  s.getModalStackLength() === 0 &&
                  o.removeModalDataFromUrl(!0),
                n && Object.keys(n).length)
              ) {
                let t = e.getEngine()._connector?.getContainerWrapper();
                if (t) {
                  let e = [...t.childNodes].find(
                    (e) => e.tagName?.indexOf('LUIGI-') === 0 && e.style?.display !== 'none'
                  );
                  e?.updateContext && e.updateContext({ goBackContext: n }, { withoutSync: !1 });
                }
              }
            }));
        }),
        p = {
          closePromise: f,
          resolveFn: u,
          onCloseRequestHandler: d,
          onInternalClose: () => {
            try {
              (c.clearDirtyState(a), p.resolveFn && p.resolveFn());
            } catch (e) {
              console.warn('onInternalClose failed', e);
            }
          },
          modalsettings: n
        };
      (s.registerModal(p),
        e.getEngine()._connector?.renderModal(
          a,
          n,
          async () => {
            try {
              await c.getUnsavedChangesModalPromise(a);
            } catch {
              return;
            }
            (r?.(),
              u && u(),
              e.getConfigValue('routing.showModalPathInUrl') &&
                s.getModalStackLength() === 0 &&
                o.removeModalDataFromUrl(!0));
          },
          () => f
        ));
      let m = e.getEngine()._connector;
      t.loadingIndicator?.enabled !== !1 && m?.showLoadingIndicator(a.parentElement);
    },
    updateModalSettings: (e, t, n) => {
      let r = W.get(_i);
      if (r.getModalStackLength() === 0) return;
      r.updateFirstModalSettings(e);
      let i = W.get(Si),
        a = U.getModalPathFromPath(n);
      (a && i.updateModalDataInUrl(a, r.getModalSettings(), t),
        n.getEngine()._connector?.updateModalSettings(r.getModalSettings()));
    },
    openDrawer: async (e, t, n, r, i) => {
      let a = W.get(gi);
      if (G.drawerContainer && a.shouldShowUnsavedChangesModal(G.drawerContainer))
        try {
          await a.getUnsavedChangesModalPromise(G.drawerContainer);
        } catch {
          return;
        }
      let o = await wi(t, e, i, 'drawer');
      G.drawerContainer = o;
      let s = new Promise((e) => {
        o.addEventListener(V.CLOSE_CURRENT_MODAL_REQUEST, async () => {
          try {
            await a.getUnsavedChangesModalPromise(o);
          } catch {
            return;
          }
          ((G.drawerContainer = void 0), a.clearDirtyState(o), e());
        });
      });
      e.getEngine()._connector?.renderDrawer(
        o,
        n,
        async () => {
          try {
            await a.getUnsavedChangesModalPromise(o);
          } catch {
            return;
          }
          (r?.(), (G.drawerContainer = void 0), a.clearDirtyState(o));
        },
        () => s
      );
      let c = e.getEngine()._connector;
      t.loadingIndicator?.enabled !== !1 && c?.showLoadingIndicator(o.parentElement);
    },
    openUserSettings: async (e, t, n, r) => {
      let i = {};
      ((e.renderMicroFrontendContainer = async (e, t) => {
        let a = e.viewUrl,
          o = e.webcomponent ?? !1,
          s = n?.[t] || {},
          c = await wi(
            {
              viewUrl: a,
              userSettingsGroup: t,
              webcomponent: o,
              context: {
                ...e.context,
                userSettingsData: s
              }
            },
            r,
            void 0,
            'usersettings'
          );
        return (
          c.addEventListener(V.CUSTOM_MESSAGE, (e) => {
            let n = e.detail;
            n?.id === 'luigi.updateUserSettings' && (i[t] = n.data?.data ?? n.data);
          }),
          c
        );
      }),
        (e.onCloseCallback = async (e, t) => {
          let n = {
            ...e,
            ...i
          };
          await r.storeUserSettings(n, t);
        }),
        r.getEngine()._connector?.openUserSettings(e, t, n));
    }
  },
  ki = new (class {
    idpProviderInstance;
    _userInfoStore;
    _loggedInStore;
    constructor() {
      ((this._userInfoStore = r({})), (this._loggedInStore = r(!1)));
    }
    setUserInfo(e) {
      this._userInfoStore.set(e);
    }
    setLoggedIn(e) {
      this._loggedInStore.set(e);
    }
    getUserInfoStore() {
      return this._userInfoStore;
    }
    getLoggedInStore() {
      return this._loggedInStore;
    }
    async init() {
      let e = s.getConfigValue('auth.use');
      if (!e) return Promise.resolve(!0);
      let t = s.getConfigValue(`auth.${e}`),
        n = u.parseUrlAuthErrors() || {};
      if (await u.handleUrlAuthErrors(t, n.error, n.errorDescription))
        return (
          (this.idpProviderInstance = this.getIdpProviderInstance(e, t)),
          a.isPromise(this.idpProviderInstance)
            ? this.idpProviderInstance
                .then((e) => ((this.idpProviderInstance = e), this.checkAuth(t)))
                .catch((e) => {
                  let t = `Error: ${e.message || e}`;
                  (console.error(t, e.message && e), s.setErrorMessage(t));
                })
            : this.checkAuth(t)
        );
    }
    async checkAuth(e) {
      let t = u.getStoredAuthData();
      if (!t || !u.isLoggedIn()) {
        if (s.getConfigValue('auth.disableAutoLogin')) return;
        let n = !0;
        return (t && (n = await l.handleAuthEvent('onAuthExpired', e)), n ? this.startAuthorization() : void 0);
      }
      (this.idpProviderInstance.settings && a.isFunction(this.idpProviderInstance.settings.userInfoFn)
        ? this.idpProviderInstance.settings.userInfoFn(this.idpProviderInstance.settings, t).then((e) => {
            (this.setUserInfo(e), this.setLoggedIn(!0));
          })
        : a.isFunction(this.idpProviderInstance.userInfo)
          ? this.idpProviderInstance.userInfo(e).then((e) => {
              (this.setUserInfo(e), this.setLoggedIn(!0));
            })
          : (this.setLoggedIn(!0), this.setUserInfo(n(this._userInfoStore))),
        a.isFunction(s.getConfigValue('auth.events.onAuthSuccessful')) &&
          c.isNewlyAuthorized() &&
          (await l.handleAuthEvent('onAuthSuccessful', e, t)),
        c.removeNewlyAuthorized(),
        a.isFunction(this.idpProviderInstance.setTokenExpirationAction) &&
          this.idpProviderInstance.setTokenExpirationAction(),
        a.isFunction(this.idpProviderInstance.setTokenExpireSoonAction) &&
          this.idpProviderInstance.setTokenExpireSoonAction());
    }
    async startAuthorization() {
      if (this.idpProviderInstance)
        return this.idpProviderInstance.login().then((e) => {
          (c.setNewlyAuthorized(), e && console.error(e));
        });
    }
    logout() {
      let e = u.getStoredAuthData(),
        t = async (e) => {
          (await l.handleAuthEvent('onLogout', this.idpProviderInstance.settings, void 0, e), c.removeAuthData());
        },
        n = s.getConfigValue(`auth.${s.getConfigValue('auth.use')}.logoutFn`),
        r = s.getConfigValueAsync('navigation.profile.logout.customLogoutFn');
      a.isFunction(n)
        ? n(this.idpProviderInstance.settings, e, t)
        : a.isFunction(this.idpProviderInstance.logout)
          ? this.idpProviderInstance.logout(e, t)
          : r && a.isFunction(r)
            ? r(e, t)
            : t(this.idpProviderInstance.settings.logoutUrl);
    }
    createIdpProviderException(e) {
      return {
        message: e,
        name: 'IdpProviderException'
      };
    }
    async getIdpProviderInstance(e, t) {
      let n = a.getConfigValueFromObject(t, 'idpProvider');
      if (n) {
        let r = await new n(t);
        return (
          ['login'].forEach((t) => {
            if (!a.isFunction(r[t]))
              throw this.createIdpProviderException(`${t} function does not exist in custom IDP Provider ${e}`);
          }),
          r
        );
      }
      if (a.isFunction(s.getConfigValue('auth.events.onAuthConfigError')))
        await l.handleAuthEvent('onAuthConfigError', {
          idpProviderName: e,
          type: 'IdpProviderException'
        });
      else throw this.createIdpProviderException(`IDP Provider ${e} does not exist.`);
    }
    unload() {
      this.idpProviderInstance && a.isFunction(this.idpProviderInstance.unload) && this.idpProviderInstance.unload();
    }
    resetExpirationChecks() {
      this.idpProviderInstance &&
        a.isFunction(this.idpProviderInstance.resetExpirationChecks) &&
        this.idpProviderInstance.resetExpirationChecks();
    }
    broadcastAuthData(e) {
      let t = s.getLuigi()?.getEngine()?._connector?.getContainerWrapper();
      if (t) {
        for (let n of t.childNodes) n.tagName?.startsWith('LUIGI-') && n.setAttribute('auth-data', JSON.stringify(e));
        (G.modalContainer?.forEach((t) => t.setAttribute('auth-data', JSON.stringify(e))),
          G.drawerContainer && G.drawerContainer.setAttribute('auth-data', JSON.stringify(e)));
      }
    }
  })(),
  Ai = {
    luigi: {
      button: {
        confirm: 'Yes',
        dismiss: 'No'
      },
      confirmationModal: {
        body: 'Are you sure you want to do this?',
        header: 'Confirmation'
      },
      navigation: {
        up: 'Up',
        tabNav: { more: 'More' }
      },
      notExactTargetNode: 'Could not map the exact target node for the requested route {route}.',
      requestedRouteNotFound: 'Could not find the requested route {route}.',
      unsavedChangesAlert: {
        body: 'Unsaved changes will be lost. Do you want to continue?',
        header: 'Unsaved changes detected'
      }
    }
  },
  ji = class {
    luigi;
    currentLocaleStorageKey;
    defaultLocale;
    listeners;
    translationImpl;
    translationTable;
    constructor(e) {
      ((this.luigi = e),
        (this.currentLocaleStorageKey = 'luigi.currentLocale'),
        (this.defaultLocale = 'en'),
        (this.listeners = {}),
        (this.translationTable = Ai));
    }
    _init() {
      (this._initCustomImplementation(),
        this.addCurrentLocaleChangeListener((e) => {
          this.broadcastLocaleToAllContainers(e);
        }));
    }
    getCurrentLocale() {
      return sessionStorage.getItem(this.currentLocaleStorageKey) || this.defaultLocale;
    }
    setCurrentLocale(e) {
      (e && (sessionStorage.setItem(this.currentLocaleStorageKey, e), this._notifyLocaleChange(e)),
        this.luigi.getEngine()._connector?.setCurrentLocale(e));
    }
    addCurrentLocaleChangeListener(e) {
      let t = null;
      return (
        a.isFunction(e)
          ? ((t = a.getRandomId()), (this.listeners[t] = e))
          : console.error('Provided locale change listener is not a function.'),
        t
      );
    }
    removeCurrentLocaleChangeListener(e) {
      e && this.listeners[e]
        ? delete this.listeners[e]
        : console.error('Unable to remove locale change listener - no listener registered for given ID.');
    }
    getTranslation(e, t = void 0, n = void 0) {
      if (!e) return '';
      if (this.translationImpl) {
        let r = this.translationImpl.getTranslation(e, t, n);
        if (r !== e) return r;
      }
      return this.findTranslation(e, this.translationTable, t) || e;
    }
    _notifyLocaleChange(e) {
      (Object.getOwnPropertyNames(this.listeners).forEach((t) => {
        this.listeners[Number(t)](e);
      }),
        this.luigi.configChanged());
    }
    _initCustomImplementation() {
      ((this.translationImpl = this.luigi.getConfigValue('settings.customTranslationImplementation')),
        a.isFunction(this.translationImpl) && (this.translationImpl = this.translationImpl()));
    }
    broadcastLocaleToAllContainers(e) {
      let t = a.getNodeList('luigi-container[lui_container]');
      t?.length &&
        e &&
        t.forEach((t) => {
          ((t.locale = e), t.updateContext({ locale: e }));
        });
    }
    findTranslation(e, t, n) {
      let r = e.split('.');
      for (let e = 0; e < r.length; e++) {
        let i = r[e];
        if (Object.prototype.hasOwnProperty.call(t, i) && typeof t[i] == 'object') t = t[i];
        else return n ? this.findInterpolations(t[i], n) : t[i];
      }
    }
    findInterpolations(e, t) {
      return (
        typeof e != 'string' ||
          !e.trim() ||
          Object.keys(t).forEach((n) => {
            e = e.replace(RegExp('{' + fi.escapeKeyForRegexp(n) + '}', 'gi'), t[n]);
          }),
        e
      );
    }
  },
  Mi = {
    getMicrofrontendsInDom(e) {
      return [
        ...this.getMainMicrofrontends(e).map((e) => ({
          container: e.iframe,
          active: e.active,
          type: 'main',
          id: e.id
        })),
        ...this.getModalMicrofrontends().map((e) => ({
          container: e.iframe,
          active: e.active,
          type: 'modal',
          id: e.id
        })),
        ...(() => {
          let e = this.getDrawerMicrofrontends();
          return e.iframe
            ? [
                {
                  container: e.iframe,
                  active: e.active,
                  type: 'drawer',
                  id: e.id
                }
              ]
            : [];
        })()
      ];
    },
    getMainMicrofrontends(e) {
      let t = e.getEngine()._connector?.getContainerWrapper();
      if (!t) return [];
      let n = [];
      for (let e of t.childNodes)
        if (e.tagName?.startsWith('LUIGI-'))
          if (e.iframeHandle?.iframe)
            n.push({
              iframe: e.iframeHandle.iframe,
              id: e.luigiMfId,
              active: a.isElementVisible(e)
            });
          else {
            let t = e.shadowRoot?.firstElementChild?.firstElementChild ?? null;
            t &&
              n.push({
                iframe: t,
                id: e.luigiMfId,
                active: a.isElementVisible(e)
              });
          }
      return n;
    },
    getModalMicrofrontends() {
      let e = [];
      for (let t of G.modalContainer)
        if (t.iframeHandle?.iframe)
          e.push({
            iframe: t.iframeHandle.iframe,
            id: t.luigiMfId,
            active: a.isElementVisible(t)
          });
        else {
          let n = t.shadowRoot?.firstElementChild?.firstElementChild ?? null;
          n &&
            e.push({
              iframe: n,
              id: t.luigiMfId,
              active: a.isElementVisible(t)
            });
        }
      return e;
    },
    getDrawerMicrofrontends() {
      if (!G.drawerContainer) return {};
      if (G.drawerContainer.iframeHandle?.iframe)
        return {
          iframe: G.drawerContainer.iframeHandle.iframe,
          id: G.drawerContainer.luigiMfId,
          active: a.isElementVisible(G.drawerContainer)
        };
      {
        let e = G.drawerContainer.shadowRoot?.firstElementChild?.firstElementChild ?? null;
        if (e)
          return {
            iframe: e,
            id: G.drawerContainer.luigiMfId,
            active: a.isElementVisible(G.drawerContainer)
          };
      }
      return {};
    },
    getAllLuigiContainerIframe(e) {
      let t = e.getEngine()._connector?.getContainerWrapper();
      if (!t) return;
      let n = [...t.children].filter((e) => e.tagName?.indexOf('LUIGI-CONTAINER') === 0 && e.iframeHandle?.iframe);
      for (let e of G.modalContainer) e.iframeHandle?.iframe && n.push(e);
      return (
        G.drawerContainer && G.drawerContainer.iframeHandle?.iframe && n.push(G.drawerContainer),
        n.length > 0 ? n : void 0
      );
    }
  },
  Ni = class {
    luigi;
    constructor(e) {
      this.luigi = e;
    }
    getShellbar() {
      return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getShellbarElement() || null;
    }
    getShellbarActions() {
      return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getShellbarActions() || null;
    }
    getLuigiContainer() {
      return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getLuigiContainer() || null;
    }
    getNavFooterContainer() {
      return this.luigi.getEngine()._connector?.getCoreAPISupportedElements().getNavFooterContainer() || null;
    }
    getMicrofrontends() {
      return Mi.getMicrofrontendsInDom(this.luigi);
    }
    getMicrofrontendIframes() {
      let e = this.luigi.getEngine()._connector?.getContainerWrapper(),
        t = [];
      if (G.modalContainer)
        for (let e of Array.from(G.modalContainer))
          e.tagName?.startsWith('LUIGI-') && e.iframeHandle?.iframe && t.push(e.iframeHandle.iframe);
      if ((G.drawerContainer && t.push(G.drawerContainer.iframeHandle.iframe), !e)) return null;
      for (let n of Array.from(e.childNodes))
        n.tagName?.startsWith('LUIGI-') && n.iframeHandle?.iframe && t.push(n.iframeHandle.iframe);
      return t;
    }
    getCurrentMicrofrontendIframe() {
      let e = this.luigi.getEngine()._connector?.getContainerWrapper();
      if (!e) return null;
      let t = G.modalContainer[0]?.iframeHandle?.iframe ?? null,
        n = null,
        r = null;
      for (let t of Array.from(e.children))
        t.tagName?.startsWith('LUIGI-') &&
          a.isElementVisible(t) &&
          (t.iframeHandle?.iframe
            ? (n = t.iframeHandle.iframe)
            : (r = t.shadowRoot?.firstElementChild?.firstElementChild ?? null));
      return t || n || r;
    }
  },
  Pi = {
    luigiAfterInit: async (e) => {
      (a.getConfigBooleanValue(e.getConfig(), 'settings.appLoadingIndicator.hideAutomatically') &&
        setTimeout(() => {
          e.ux().hideAppLoadingIndicator();
        }, 0),
        await s.executeConfigFnAsync('lifecycleHooks.luigiAfterInit'));
    }
  },
  Fi = class {
    featureToggleList;
    constructor() {
      this.featureToggleList = /* @__PURE__ */ new Set();
    }
    setFeatureToggle(e, t = !1) {
      this.isValid(e) && ((e.startsWith('!') && !t) || this.isDuplicatedOrDisabled(e) || this.featureToggleList.add(e));
    }
    unsetFeatureToggle(e) {
      if (this.isValid(e)) {
        if (!this.featureToggleList.has(e)) {
          console.warn('Feature toggle name is not in the list.');
          return;
        }
        this.featureToggleList.delete(e);
      }
    }
    getActiveFeatureToggleList() {
      return [...Array.from(this.featureToggleList)].filter((e) => !e.startsWith('!'));
    }
    isValid(e) {
      return a.isString(e) ? !0 : (console.warn("Feature toggle name is not valid or not of type 'string'"), !1);
    }
    isDuplicatedOrDisabled(e) {
      return this.featureToggleList.has(e)
        ? (console.warn('Feature toggle name already exists'), !0)
        : this.featureToggleList.has(`!${e}`)
          ? (console.warn('Disabled feature toggle can not be activated'), !0)
          : !1;
    }
  },
  Ii = class {
    luigi;
    isSearchFieldVisible = !1;
    isSearchResultVisible = !1;
    searchQuery = '';
    searchResult = [];
    constructor(e) {
      ((this.luigi = e), (this.luigi = e));
    }
    get searchProvider() {
      return this.luigi.getConfigValue('globalSearch.searchProvider');
    }
    getHandler() {
      return this.luigi.getEngine()._connector?.getGlobalSearchHandler?.();
    }
    hasSearchProvider() {
      return this.searchProvider ? !0 : (console.warn('No search provider defined.'), !1);
    }
    getFieldVisibility() {
      return this.isSearchFieldVisible;
    }
    setFieldVisibility(e) {
      this.isSearchFieldVisible = e;
    }
    showSearchResult(e) {
      let t =
        this.luigi.getConfigValue('globalSearch.searchFieldCentered') &&
        this.luigi.getConfigValue('settings.experimental.globalSearchCentered');
      e?.length
        ? this.getHandler()?.showSearchResult(e, this.searchQuery, !!t, (t) => {
            t && a.isFunction(this.searchProvider.customSearchResultRenderer)
              ? mi.handleSearchResultRenderer(this.searchProvider, e, t)
              : ((this.isSearchResultVisible = !0), (this.searchResult = e));
          })
        : console.warn('Search result array is empty.');
    }
    closeSearchResult() {
      ((this.isSearchResultVisible = !1), (this.searchResult = []));
    }
    getSearchQuery() {
      return this.searchQuery;
    }
    setSearchQuery(e) {
      ((this.searchQuery = e || ''),
        this.getHandler()?.setSearchString(this.searchQuery, (e) => {
          e &&
            ((e.value = this.searchQuery),
            this.searchProvider.onInput && a.isFunction(this.searchProvider.onInput)
              ? this.searchProvider.onInput()
              : console.error('onInput is not a function. Please check the global search configuration.'));
        }));
    }
    setSearchInputPlaceholder(e) {
      ((e ||= mi.getSearchPlaceholder(this.luigi) || ''), this.getHandler()?.setSearchInputPlaceholder(e));
    }
    toggleSearch() {
      this.setFieldVisibility(!this.isSearchFieldVisible);
      let e = this.getHandler();
      (e?.toggleSearch(this.isSearchFieldVisible, (e) => {
        mi.toggleSearch(this.isSearchFieldVisible, this.searchProvider, e);
      }),
        e?.clearSearchField());
    }
  },
  Li = class {
    luigi;
    globalSearchService;
    constructor(e) {
      ((this.luigi = e), (this.globalSearchService = W.get(Ii)));
    }
    openSearchField() {
      this.globalSearchService.hasSearchProvider() &&
        (this.globalSearchService.setFieldVisibility(!0),
        this.luigi.getEngine()._connector?.getGlobalSearchHandler?.()?.openSearchField());
    }
    closeSearchField() {
      this.globalSearchService.hasSearchProvider() &&
        (this.globalSearchService.setFieldVisibility(!1),
        this.luigi.getEngine()._connector?.getGlobalSearchHandler?.()?.closeSearchField());
    }
    clearSearchField() {
      this.globalSearchService.hasSearchProvider() &&
        (this.globalSearchService.setSearchQuery(''),
        this.luigi.getEngine()._connector?.getGlobalSearchHandler?.()?.clearSearchField(),
        this.closeSearchResult());
    }
    showSearchResult(e) {
      this.globalSearchService.hasSearchProvider() && this.globalSearchService.showSearchResult(e);
    }
    closeSearchResult() {
      (this.globalSearchService.closeSearchResult(),
        this.luigi.getEngine()._connector?.getGlobalSearchHandler?.()?.closeSearchResult());
    }
    getSearchString() {
      return this.globalSearchService.getSearchQuery();
    }
    setSearchString(e) {
      this.globalSearchService.setSearchQuery(e);
    }
    setSearchInputPlaceholder(e) {
      this.globalSearchService.setSearchInputPlaceholder(e);
    }
  },
  Ri = class {
    luigi;
    hashRouting = !1;
    navService;
    routingService;
    modalService;
    options = {
      fromContext: null,
      fromClosestContext: !1,
      fromVirtualTreeRoot: !1,
      fromParent: !1,
      nodeParams: {}
    };
    constructor(e) {
      ((this.luigi = e),
        (this.hashRouting = e.getConfig().routing?.useHashRouting),
        (this.navService = W.get(yi)),
        (this.routingService = W.get(Si)),
        (this.modalService = W.get(_i)));
    }
    navigate = async (e, t, n, r, i) => {
      if (e === '/' && (n || i))
        return (
          console.warn('Navigation with an absolute path prevented.'),
          Promise.reject(/* @__PURE__ */ Error('Navigation with an absolute path prevented.'))
        );
      let a = e[0] !== '/';
      this.options.relative = a;
      let o = {
        modalSettings: n,
        newTab: !1,
        options: this.options,
        path: e,
        preserveView: t,
        preventContextUpdate: !1,
        preventHistoryEntry: !1,
        withoutSync: !1
      };
      return this.navService.handleNavigationRequest(o, void 0);
    };
    navigateToIntent = (e, t = {}) => {
      let n = '#?intent=';
      if (((n += e), t && Object.keys(t)?.length)) {
        let e = Object.entries(t);
        if (e.length > 0) {
          n += '?';
          for (let [t, r] of e) n += t + '=' + r + '&';
          n = n.slice(0, -1);
        }
      }
      this.navigate(n);
    };
    openAsModal = async (e, t, n) => {
      if (e === '/')
        return (
          console.warn('Navigation with an absolute path prevented.'),
          Promise.reject(/* @__PURE__ */ Error('Navigation with an absolute path prevented.'))
        );
      if (
        (await this.navService.shouldPreventNavigationForPath(e)) ||
        (!t?.keepPrevious && !(await this.modalService.closeModalsWithDirtyCheck()))
      )
        return;
      let r = e.replace(/\/\/+/g, '/');
      if (!(await H.validatePathAndGetRedirect(r, this.luigi))) return;
      let i = await this.navService.getCurrentNode(r),
        a = t || {};
      a.title ||= i?.label;
      let o = a.nodeParams || this.options.nodeParams || {},
        s = r;
      if (o && Object.keys(o).length > 0) {
        let e = U.getContentViewParamPrefix(this.luigi),
          t = Object.entries(o)
            .map(([t, n]) => e + encodeURIComponent(t) + '=' + encodeURIComponent(n))
            .join('&');
        s += (s.includes('?') ? '&' : '?') + t;
      }
      let { nodeParams: c, ...l } = a;
      (this.luigi.getConfigValue('routing.showModalPathInUrl') &&
        this.modalService.getModalStackLength() === 0 &&
        this.routingService.appendModalDataToUrl(s, l),
        this.luigi.getEngine()._ui.openModal(this.luigi, i, a, n, {
          nodeParams: o,
          pathParams: {},
          searchParams: {}
        }));
    };
    openAsDrawer = async (e, t, n) => {
      if (e === '/')
        return (
          console.warn('Navigation with an absolute path prevented.'),
          Promise.reject(/* @__PURE__ */ Error('Navigation with an absolute path prevented.'))
        );
      if (await this.navService.shouldPreventNavigationForPath(e)) return;
      let r = e.replace(/\/\/+/g, '/');
      if (!(await H.validatePathAndGetRedirect(r, this.luigi))) return;
      let i = await this.navService.getCurrentNode(r),
        a = t || {};
      if (!a.header?.title) {
        let e = (await U.getNodeLabel(i, this.luigi)) || '';
        a.header ? (a.header.title = e) : (a.header = { title: e });
      }
      a.overlap === void 0 && (a.overlap = !0);
      let o = a.nodeParams || this.options.nodeParams || {};
      this.luigi.getEngine()._ui.openDrawer(this.luigi, i, a, n, {
        nodeParams: o,
        pathParams: {},
        searchParams: {}
      });
    };
    runTimeErrorHandler = async (e) => {
      let { path: t } = U.getCurrentPath(this.luigi, this.luigi.getConfig().routing?.useHashRouting),
        n = await this.navService.getCurrentNode(t),
        r = this.luigi.getConfigValue('navigation.defaults.runTimeErrorHandler');
      n?.runTimeErrorHandler?.errorFn && a.isFunction(n?.runTimeErrorHandler?.errorFn)
        ? n.runTimeErrorHandler.errorFn(e, n)
        : r?.errorFn && a.isFunction(r.errorFn) && r.errorFn(e, n);
    };
    pathExists = async (e) => await U.pathExists(e, this.luigi);
    fromVirtualTreeRoot() {
      return (
        (this.options.fromContext = null),
        (this.options.fromClosestContext = !1),
        (this.options.fromVirtualTreeRoot = !0),
        (this.options.fromParent = !1),
        this
      );
    }
    fromContext(e) {
      return ((this.options.fromContext = e), this);
    }
    fromClosestContext() {
      return (
        (this.options.fromContext = null),
        (this.options.fromClosestContext = !0),
        (this.options.fromParent = !1),
        this
      );
    }
    fromParent() {
      return (
        (this.options.fromContext = null),
        (this.options.fromClosestContext = !1),
        (this.options.fromVirtualTreeRoot = !1),
        (this.options.fromParent = !0),
        this
      );
    }
    withParams(e) {
      return (e && Object.assign(this.options.nodeParams ?? {}, e), this);
    }
    async updateTopNavigation() {
      this.luigi.configChanged('navigation');
    }
  },
  zi = class {
    luigi;
    constructor(e) {
      this.luigi = e;
    }
    addSearchParams(e, t = !1, n = !1) {
      if (!a.isObject(e)) {
        console.log('Params argument must be an object');
        return;
      }
      let r = new URL(location.href);
      (this.luigi.getConfigValue('routing.useHashRouting')
        ? (r.hash = U.addParamsOnHashRouting(e, r.hash))
        : U.modifySearchParams(e, r.searchParams),
        this.handleBrowserHistory(t, r),
        n || this.luigi.configChanged());
    }
    getSearchParams() {
      let e = {},
        t = ['__proto__', 'constructor', 'prototype'],
        n = new URL(location.href),
        r;
      if (this.luigi.getConfigValue('routing.useHashRouting')) {
        let e = n.hash.split('?')[1];
        r = e ? new URLSearchParams(e).entries() : [];
      } else r = n.searchParams.entries();
      for (let [n, i] of r) {
        if (t.some((e) => n === e)) {
          console.warn(`Blocked because of potentially dangerous query param: ${n}`);
          continue;
        }
        e[n] = i;
      }
      return e;
    }
    handleBrowserHistory(e, t) {
      let n = this.sanitizeUrl(t.href);
      if (!n) {
        console.warn('invalid url: ' + n);
        return;
      }
      e ? window.history.pushState({}, '', n) : window.history.replaceState({}, '', n);
    }
    sanitizeUrl(e) {
      return new URL(location.href).origin === new URL(e).origin ? e : void 0;
    }
    addNodeParams(e, t) {
      if (!a.isObject(e)) {
        console.log('Params argument must be an object');
        return;
      }
      let n = U.getContentViewParamPrefix(this.luigi),
        r = new URL(location.href);
      (this.luigi.getConfigValue('routing.useHashRouting')
        ? (r.hash = U.addParamsOnHashRouting(e, r.hash, n))
        : U.modifySearchParams(e, r.searchParams, n),
        this.handleBrowserHistory(t, r),
        this.luigi.getConfigValue('routing.useHashRouting')
          ? window.dispatchEvent(new HashChangeEvent('hashchange'))
          : this.luigi.configChanged());
    }
    getAnchor() {
      let { hash: e } = new URL(window.location.href);
      return this.luigi.getConfigValue('routing.useHashRouting') && e.split('#').length === 2
        ? ''
        : e.split('#').pop() || '';
    }
    setAnchor(e) {
      if (!(!e || e === ''))
        if (this.luigi.getConfigValue('routing.useHashRouting')) {
          let { hash: t } = new URL(window.location.href),
            n = t.split('#');
          ((e = [...(n.length > 2 ? n.slice(0, -1) : n), e].join('#')), window.history.pushState(null, '', e));
        } else window.location.hash = e;
    }
  },
  Bi = class {
    #e;
    #t = '';
    constructor(e) {
      this.#e = e;
    }
    async getAvailableThemes() {
      return await this.#e.getConfigValueAsync('settings.theming.themes');
    }
    setCurrentTheme(e) {
      ((this.#t = e), (this.#e.__cssVars = void 0));
    }
    async getThemeObject(e) {
      return (await this.getAvailableThemes())?.find((t) => t.id === e);
    }
    getCurrentTheme() {
      if (!this.isThemingAvailable()) return !1;
      if (this.#t) return this.#t;
      let e = this.#e.getConfigValue('settings.theming');
      return (
        e.defaultTheme ||
          console.error(
            '[Theming] getCurrentTheme() error. No theme set and no defaultTheme found in configuration',
            e
          ),
        e.defaultTheme
      );
    }
    isThemingAvailable() {
      return !!this.#e.getConfigValue('settings.theming');
    }
    async getCSSVariables() {
      if (!window.Luigi.__cssVars) {
        let e = this.#e.getConfigValue('settings.theming.variables.file');
        if (e)
          try {
            let t = await fetch(e);
            ((window.Luigi.__cssVars = (await t.json()).root),
              Object.keys(window.Luigi.__cssVars).forEach((e) => {
                let t = getComputedStyle(document.documentElement).getPropertyValue('--' + e);
                t && (window.Luigi.__cssVars[e] = t);
              }));
          } catch (e) {
            a.isFunction(this.#e.getConfigValue('settings.theming.variables.errorHandling'))
              ? this.#e.getConfigValue('settings.theming.variables.errorHandling')(e)
              : console.error('CSS variables file error: ', e);
          }
        else
          this.#e.getConfigValue('settings.theming.variables') === 'fiori' && window.__luigiThemeVars
            ? ((window.Luigi.__cssVars = {}),
              window.__luigiThemeVars.forEach((e) => {
                window.Luigi.__cssVars[e] = getComputedStyle(document.documentElement).getPropertyValue('--' + e);
              }))
            : (window.Luigi.__cssVars = {});
      }
      return window.Luigi.__cssVars;
    }
    _init() {
      let e = W.get(Ci);
      (() => {
        let t = this.#e.getConfigValue('settings.theming');
        (t &&
          t.nodeViewURLDecorator &&
          t.nodeViewURLDecorator.queryStringParameter &&
          e.add({
            type: 'queryString',
            uid: 'theming',
            key: t.nodeViewURLDecorator.queryStringParameter.keyName,
            valueFn: () => {
              let e = this.getCurrentTheme(),
                n = t.nodeViewURLDecorator.queryStringParameter.value;
              return n ? n(e) : e;
            }
          }),
          t && t.useFioriScrollbars === !0 && document.body.classList.add('fioriScrollbars'));
      })();
    }
  },
  Vi = new (class {
    processUserSettingGroups(e, t) {
      let n = [],
        r = e?.userSettingGroups,
        i = t?.userSettings?.userSettingGroups,
        o = r || i;
      if (a.isObject(o)) {
        for (let e in o) {
          let t = {};
          ((t[e] = o[e]), n.push(t));
        }
        return n;
      }
      return n;
    }
    getUserSettingsIframesInDom() {
      let e = document.querySelector('.iframeUserSettingsCtn');
      return e ? [...e.children] : [];
    }
    hideUserSettingsIframe() {
      this.getUserSettingsIframesInDom().forEach((e) => {
        e.style.display = 'none';
      });
    }
    findActiveCustomUserSettingsIframe(e) {
      let t = document.querySelectorAll('[userSettingsGroup]');
      for (let n = 0; n < t.length; n++) if (t[n].contentWindow === e) return t[n];
      return null;
    }
  })(),
  Hi = class {
    luigi;
    dirtyStatusService = W.get(gi);
    appLoadingIndicatorSelector = '[luigi-app-loading-indicator]';
    constructor(e) {
      this.luigi = e;
    }
    showAlert = (e) =>
      new Promise((t) => {
        ((e.id ||= a.getRandomId().toString()),
          this.luigi.getEngine()._connector?.renderAlert(e, {
            openFromClient: !1,
            close: () => {
              t(!0);
            },
            link: (n) => {
              if (e.links) {
                let r = e.links[n];
                if (r && (r.url && this.luigi?.navigation().navigate(r.url), r.dismissKey))
                  return (t(r.dismissKey), !0);
              }
              return !1;
            }
          }));
      });
    showConfirmationModal = (e) => {
      if (e) {
        let t = e.body ? e.body : this.luigi.i18n().getTranslation('luigi.confirmationModal.body');
        e = {
          ...e,
          header: this.luigi.i18n().getTranslation(e.header || 'luigi.confirmationModal.header'),
          body: fi.sanatizeHtmlExceptTextFormatting(t),
          buttonDismiss: this.luigi.i18n().getTranslation(e.buttonDismiss || 'luigi.button.dismiss'),
          buttonConfirm:
            e.buttonConfirm === !1 ? !1 : this.luigi.i18n().getTranslation(e.buttonConfirm || 'luigi.button.confirm')
        };
      }
      return new Promise((t, n) => {
        this.luigi.getEngine()._connector?.renderConfirmationModal(e, {
          confirm() {
            t(!0);
          },
          dismiss() {
            n();
          }
        });
      });
    };
    collapseLeftSideNav = (e) => {
      this.luigi.getEngine()._connector?.collapseLeftSideNav(e);
    };
    openUserSettings = async () => {
      let e = this.luigi.getConfigValue('userSettings');
      if (!e) return;
      let t = this.luigi.getConfigValue('settings'),
        n = await this.luigi.readUserSettings(),
        r = Vi.processUserSettingGroups(e, t),
        i = e.userSettingsDialog || {},
        a = i.dialogHeader || hi.userSettingsDialog.dialogHeader,
        o = i.saveBtn || hi.userSettingsDialog.saveBtn,
        s = i.dismissBtn || hi.userSettingsDialog.dismissBtn,
        c = {
          dialogHeader: this.luigi.i18n().getTranslation(a),
          saveBtn: this.luigi.i18n().getTranslation(o),
          dismissBtn: this.luigi.i18n().getTranslation(s)
        };
      this.luigi.getEngine()._ui?.openUserSettings(c, r, n, this.luigi);
    };
    closeUserSettings = () => {
      this.luigi.getEngine()._connector?.closeUserSettings();
    };
    setDocumentTitle = (e) => {
      (this.luigi.getEngine()._ux?.documentTitle?.set(e), this.luigi.getEngine()._connector?.setDocumentTitle(e));
    };
    getDocumentTitle = () => n(this.luigi.getEngine()._ux?.documentTitle) || window.document.title || '';
    hideAppLoadingIndicator = () => {
      let e = document.querySelector(this.appLoadingIndicatorSelector);
      e &&
        (e.classList.add('hidden'),
        setTimeout(() => {
          e.parentNode?.removeChild(e);
        }, 500));
    };
    showLoadingIndicator = (e) => this.luigi.getEngine()._connector?.showLoadingIndicator(e);
    hideLoadingIndicator = (e) => this.luigi.getEngine()._connector?.hideLoadingIndicator(e);
    addBackdrop = () => this.luigi.getEngine()._connector?.addBackdrop();
    removeBackdrop = () => this.luigi.getEngine()._connector?.removeBackdrop();
    getDirtyStatus = () => this.dirtyStatusService.readDirtyStatus();
  },
  Ui = new (class {
    filterIdFromMessageObject(e) {
      let { id: t, ...n } = e;
      return {
        id: t,
        messageWithoutId: n
      };
    }
  })(),
  Wi = class {
    luigi;
    constructor(e) {
      this.luigi = e;
    }
    sendToAll(e) {
      let t = Mi.getAllLuigiContainerIframe(this.luigi);
      if (!t) {
        console.warn('No Luigi containers found to send the message to.');
        return;
      }
      let { id: n, messageWithoutId: r } = Ui.filterIdFromMessageObject(e);
      if (!n) {
        console.warn('Message object must contain an "id" property to specify the message type.');
        return;
      }
      for (let e of t)
        e.sendCustomMessage
          ? e.sendCustomMessage(n, r)
          : console.warn('Container does not support sending custom messages:', e);
    }
    send(e, t) {
      let n = Mi.getAllLuigiContainerIframe(this.luigi);
      if (!n) {
        console.warn('No Luigi containers found to send the message to.');
        return;
      }
      let { id: r, messageWithoutId: i } = Ui.filterIdFromMessageObject(t);
      if (!r) {
        console.warn('Message object must contain an "id" property to specify the message type.');
        return;
      }
      for (let t of n)
        if (t.luigiMfId === e) {
          t.sendCustomMessage
            ? t.sendCustomMessage(r, i)
            : console.warn('Container does not support sending custom messages:', t);
          return;
        }
      console.warn(`No container found with microfrontend ID: ${e}`);
    }
  },
  Gi = class {
    engine;
    config;
    _customMessages;
    _store;
    _featureToggles;
    _globalSearch;
    _i18n;
    _theming;
    _routing;
    _elements;
    __cssVars;
    preventLoadingModalData;
    initialized = !1;
    configReadyCallback = function () {};
    USER_SETTINGS_KEY = 'luigi.preferences.userSettings';
    constructor(e) {
      ((this.engine = e), (this._store = this.createConfigStore()));
    }
    getEngine() {
      return this.engine;
    }
    setConfig = (e) => {
      ((this.config = e),
        this.setConfigCallback(this.getConfigReadyCallback()),
        ki.init().then(() => {
          (this.engine.init(), this.initialized || ((this.initialized = !0), Pi.luigiAfterInit(this)));
        }));
    };
    getConfig = () => this.config;
    configChanged = (...e) => {
      this.getEngine()._ui.update(e);
    };
    getConfigValue(e) {
      return a.getConfigValueFromObject(this.getConfig(), e);
    }
    getConfigValueAsync(e, ...t) {
      return o.getConfigValueFromObjectAsync(this.getConfig(), e, t);
    }
    clearNavigationCache() {
      W.get(vi).deleteCache();
      let e = (t) => {
        t &&
          t.forEach &&
          t.forEach((t) => {
            (t.titleResolver && t.titleResolver._cache && (t.titleResolver._cache = void 0),
              t.children && e(t.children));
          });
      };
      e(this.getConfig().navigation.nodes);
    }
    setGlobalContext(e, t) {
      this.config &&
        this.config.navigation &&
        ((this.config.navigation.globalContext = e), t || this.configChanged('navigation'));
    }
    getGlobalContext() {
      return this.config?.navigation?.globalContext || {};
    }
    updateContextValues(e) {
      let t = a.getNodeList('luigi-container[lui_container]');
      t &&
        t.forEach((t) => {
          let n = {
            ...(t.context || {}),
            ...e
          };
          ((t.context = n), t.updateContext && t.updateContext(n, { withoutSync: !1 }));
        });
    }
    async readUserSettings() {
      let e =
        (await this.getConfigValueAsync('userSettings')) || (await this.getConfigValueAsync('settings.userSettings'));
      if (e && a.isFunction(e.readUserSettings)) return e.readUserSettings();
      let t = localStorage.getItem(this.USER_SETTINGS_KEY);
      return t && JSON.parse(t);
    }
    async storeUserSettings(e, t) {
      let n =
        (await this.getConfigValueAsync('userSettings')) || (await this.getConfigValueAsync('settings.userSettings'));
      if (n && a.isFunction(n.storeUserSettings)) return n.storeUserSettings(e, t);
      (localStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(e)), this.configChanged());
    }
    reset() {
      let e = this.getConfig();
      (this.unload(), this.setConfig(e));
    }
    unload() {
      ((this.initialized = !1),
        window.Luigi._store.clear(),
        ki.unload(),
        xi.removeAllEventListeners(),
        this.getEngine()._connector?.unload(),
        (this._i18n = void 0));
    }
    customMessages = () => ((this._customMessages ||= new Wi(this)), this._customMessages);
    i18n = () => ((this._i18n ||= new ji(this)), this._i18n);
    elements = () => ((this._elements ||= new Ni(this)), this._elements);
    navigation = () => new Ri(this);
    ux = () => new Hi(this);
    featureToggles = () => ((this._featureToggles ||= new Fi()), this._featureToggles);
    globalSearch = () => ((this._globalSearch ||= new Li(this)), this._globalSearch);
    routing = () => ((this._routing ||= new zi(this)), this._routing);
    theming = () => ((this._theming ||= new Bi(this)), this._theming);
    auth = () => l;
    createConfigStore() {
      let e = r({}),
        t = {},
        n = [];
      return {
        subscribe: (t) => {
          n.push(e.subscribe(t));
        },
        reset: (t) => {
          e.update(t);
        },
        subscribeToScope: (e, n) => {
          let r = t[n];
          (r || ((r = /* @__PURE__ */ new Set()), (t[n] = r)), r.add(e));
        },
        fire: (e, n) => {
          let r = t[e];
          r &&
            [...r].forEach((e) => {
              e(n);
            });
        },
        clear: () => {
          (n.forEach((e) => {
            e();
          }),
            (n = []));
        }
      };
    }
    getConfigReadyCallback() {
      return new Promise((e) => {
        (this.i18n()._init(), e());
      });
    }
    setConfigCallback(e) {
      this.configReadyCallback = e;
    }
  },
  Ki = Array.isArray,
  qi = Array.prototype.indexOf,
  Ji = Array.prototype.includes,
  Yi = Array.from,
  Xi = Object.defineProperty,
  Zi = Object.getOwnPropertyDescriptor,
  Qi = Object.prototype,
  $i = Array.prototype,
  ea = Object.getPrototypeOf,
  ta = Object.isExtensible,
  na = () => {};
function ra(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function ia() {
  var e, t;
  return {
    promise: new Promise((n, r) => {
      ((e = n), (t = r));
    }),
    resolve: e,
    reject: t
  };
}
var aa = 1024,
  oa = 2048,
  sa = 4096,
  ca = 8192,
  la = 16384,
  ua = 32768,
  da = 1 << 25,
  fa = 65536,
  pa = 1 << 19,
  ma = 1 << 20,
  ha = 65536,
  ga = 1 << 21,
  _a = 1 << 23,
  va = Symbol('$state'),
  ya = Symbol('attributes'),
  ba = Symbol('class'),
  xa = Symbol('style'),
  Sa = Symbol('text'),
  Ca = new (class extends Error {
    name = 'StaleReactionError';
    message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })();
globalThis.document?.contentType;
function wa() {
  throw Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function Ta() {
  throw Error('https://svelte.dev/e/state_descriptors_fixed');
}
function Ea() {
  throw Error('https://svelte.dev/e/state_prototype_fixed');
}
function Da() {
  throw Error('https://svelte.dev/e/state_unsafe_mutation');
}
function Oa() {
  throw Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
//#endregion
//#region node_modules/svelte/src/constants.js
var K = {},
  ka = Symbol();
function Aa() {
  console.warn('https://svelte.dev/e/derived_inert');
}
function ja(e) {
  console.warn('https://svelte.dev/e/hydration_mismatch');
}
function Ma() {
  console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var Na = !1,
  Pa;
function Fa(e) {
  if (e === null) throw (ja(), K);
  return (Pa = e);
}
function Ia() {
  return Fa(/* @__PURE__ */ Xo(Pa));
}
function La(e = 1) {
  if (Na) {
    for (var t = e, n = Pa; t--; ) n = /* @__PURE__ */ Xo(n);
    Pa = n;
  }
}
function Ra(e = !0) {
  for (var t = 0, n = Pa; ; ) {
    if (n.nodeType === 8) {
      var r = n.data;
      if (r === ']') {
        if (t === 0) return n;
        --t;
      } else (r === '[' || r === '[!' || (r[0] === '[' && !isNaN(Number(r.slice(1))))) && (t += 1);
    }
    var i = /* @__PURE__ */ Xo(n);
    (e && n.remove(), (n = i));
  }
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function za(e) {
  return e === this.v;
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
var Ba = !1,
  Va = !1;
function Ha() {
  Va = !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var Ua = null;
function Wa(e) {
  Ua = e;
}
function Ga(e, t = !1, n) {
  Ua = {
    p: Ua,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: X,
    l:
      Va && !t
        ? {
            s: null,
            u: null,
            $: []
          }
        : null
  };
}
function Ka(e) {
  var t = Ua,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) es(r);
  }
  return (e !== void 0 && (t.x = e), (t.i = !0), (Ua = t.p), e ?? {});
}
function qa() {
  return !Va || (Ua !== null && Ua.l === null);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ja = [];
function Ya() {
  var e = Ja;
  ((Ja = []), ra(e));
}
function Xa(e) {
  if (Ja.length === 0 && !uo) {
    var t = Ja;
    queueMicrotask(() => {
      t === Ja && Ya();
    });
  }
  Ja.push(e);
}
function Za(e) {
  var t = X;
  if (t === null) return ((Y.f |= _a), e);
  if (!(t.f & 32768) && !(t.f & 4)) throw e;
  Qa(e, t);
}
function Qa(e, t) {
  for (; t !== null; ) {
    if (t.f & 128) {
      if (!(t.f & 32768)) throw e;
      try {
        t.b.error(e);
        return;
      } catch (t) {
        e = t;
      }
    }
    t = t.parent;
  }
  throw e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var $a = ~(oa | sa | aa);
function eo(e, t) {
  e.f = (e.f & $a) | t;
}
function to(e) {
  e.f & 512 || e.deps === null ? eo(e, aa) : eo(e, sa);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function no(e) {
  if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || ((t.f ^= ha), no(t.deps));
}
function ro(e, t, n) {
  (e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), no(e.deps), eo(e, aa));
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var io = !1,
  ao = null,
  oo = null,
  q = null,
  so = null,
  co = null,
  lo = null,
  uo = !1,
  fo = !1,
  po = null,
  mo = null,
  ho = 0,
  go = 1,
  _o = class e {
    id = go++;
    #e = !1;
    linked = !0;
    #t = null;
    #n = null;
    async_deriveds = /* @__PURE__ */ new Map();
    current = /* @__PURE__ */ new Map();
    previous = /* @__PURE__ */ new Map();
    unblocked = /* @__PURE__ */ new Set();
    #r = /* @__PURE__ */ new Set();
    #i = /* @__PURE__ */ new Set();
    #a = /* @__PURE__ */ new Set();
    #o = 0;
    #s = /* @__PURE__ */ new Map();
    #c = null;
    #l = [];
    #u = [];
    #d = /* @__PURE__ */ new Set();
    #f = /* @__PURE__ */ new Set();
    #p = /* @__PURE__ */ new Map();
    #m = /* @__PURE__ */ new Set();
    is_fork = !1;
    #h = !1;
    #g() {
      if (this.is_fork) return !0;
      for (let n of this.#s.keys()) {
        for (var e = n, t = !1; e.parent !== null; ) {
          if (this.#p.has(e)) {
            t = !0;
            break;
          }
          e = e.parent;
        }
        if (!t) return !0;
      }
      return !1;
    }
    skip_effect(e) {
      (this.#p.has(e) ||
        this.#p.set(e, {
          d: [],
          m: []
        }),
        this.#m.delete(e));
    }
    unskip_effect(e, t = (e) => this.schedule(e)) {
      var n = this.#p.get(e);
      if (n) {
        this.#p.delete(e);
        for (var r of n.d) (eo(r, oa), t(r));
        for (r of n.m) (eo(r, sa), t(r));
      }
      this.#m.add(e);
    }
    #_() {
      if (((this.#e = !0), ho++ > 1e3 && (this.#w(), vo()), !this.#g())) {
        for (let e of this.#d) (this.#f.delete(e), eo(e, oa), this.schedule(e));
        for (let e of this.#f) (eo(e, sa), this.schedule(e));
      }
      let t = this.#l;
      ((this.#l = []), this.apply());
      var n = (po = []),
        r = [],
        i = (mo = []);
      for (let e of t)
        try {
          this.#v(e, n, r);
        } catch (t) {
          throw (To(e), t);
        }
      if (((q = null), i.length > 0)) {
        var a = e.ensure();
        for (let e of i) a.schedule(e);
      }
      if (((po = null), (mo = null), this.#g())) {
        (this.#x(r), this.#x(n));
        for (let [e, t] of this.#p) wo(e, t);
        i.length > 0 && q.#_();
        return;
      }
      let o = this.#y();
      if (o) {
        o.#b(this);
        return;
      }
      (this.#d.clear(), this.#f.clear());
      for (let e of this.#r) e(this);
      (this.#r.clear(), (so = this), bo(r), bo(n), (so = null), this.#c?.resolve());
      var s = q;
      if ((this.linked && this.#o === 0 && this.#w(), Ba && !this.linked && (this.#S(), (q = s)), this.#l.length > 0)) {
        s === null && ((s = this), this.#C());
        let e = s;
        e.#l.push(...this.#l.filter((t) => !e.#l.includes(t)));
      }
      s !== null && s.#_();
    }
    #v(e, t, n) {
      e.f ^= aa;
      for (var r = e.first; r !== null; ) {
        var i = r.f,
          a = (i & 96) != 0;
        if (!((a && i & 1024) || i & 8192 || this.#p.has(r)) && r.fn !== null) {
          a
            ? (r.f ^= aa)
            : i & 4
              ? t.push(r)
              : Ba && i & 16777224
                ? n.push(r)
                : Ms(r) && (i & 16 && this.#f.add(r), Ls(r));
          var o = r.first;
          if (o !== null) {
            r = o;
            continue;
          }
        }
        for (; r !== null; ) {
          var s = r.next;
          if (s !== null) {
            r = s;
            break;
          }
          r = r.parent;
        }
      }
    }
    #y() {
      for (var e = this.#t; e !== null; ) {
        if (!e.is_fork) {
          for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
        }
        e = e.#t;
      }
      return null;
    }
    #b(e) {
      for (let [t, n] of e.current)
        (!this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n));
      for (let [t, n] of e.async_deriveds) {
        let e = this.async_deriveds.get(t);
        e && n.promise.then(e.resolve);
      }
      let t = (e) => {
        var n = e.reactions;
        if (n !== null)
          for (let e of n) {
            var r = e.f;
            if (r & 2) t(e);
            else {
              var i = e;
              r & 4194320 && !this.async_deriveds.has(i) && (this.#f.delete(i), eo(i, oa), this.schedule(i));
            }
          }
      };
      for (let e of this.current.keys()) t(e);
      (this.oncommit(() => e.discard()), e.#w(), (q = this), this.#_());
    }
    #x(e) {
      for (var t = 0; t < e.length; t += 1) ro(e[t], this.#d, this.#f);
    }
    capture(e, t, n = !1) {
      (e.v !== ka && !this.previous.has(e) && this.previous.set(e, e.v),
        e.f & 8388608 || (this.current.set(e, [t, n]), co?.set(e, t)),
        this.is_fork || (e.v = t));
    }
    activate() {
      q = this;
    }
    deactivate() {
      ((q = null), (co = null));
    }
    flush() {
      try {
        ((fo = !0), (q = this), this.#_());
      } finally {
        ((ho = 0), (lo = null), (po = null), (mo = null), (fo = !1), (q = null), (co = null), Io.clear());
      }
    }
    discard() {
      for (let e of this.#i) e(this);
      (this.#i.clear(), this.#a.clear(), this.#w());
    }
    register_created_effect(e) {
      this.#u.push(e);
    }
    #S() {
      this.#w();
      for (let l = ao; l !== null; l = l.#n) {
        var e = l.id < this.id,
          t = [];
        for (let [r, [i, a]] of this.current) {
          if (l.current.has(r)) {
            var n = l.current.get(r)[0];
            if (e && i !== n) l.current.set(r, [i, a]);
            else continue;
          }
          t.push(r);
        }
        if (e)
          for (let [e, t] of this.async_deriveds) {
            let n = l.async_deriveds.get(e);
            n && t.promise.then(n.resolve);
          }
        if (l.#e) {
          var r = [...l.current.keys()].filter((e) => !this.current.has(e));
          if (r.length === 0) e && l.discard();
          else if (t.length > 0) {
            if (e)
              for (let e of this.#m)
                l.unskip_effect(e, (e) => {
                  e.f & 4194320 ? l.schedule(e) : l.#x([e]);
                });
            l.activate();
            var i = /* @__PURE__ */ new Set(),
              a = /* @__PURE__ */ new Map();
            for (var o of t) xo(o, r, i, a);
            a = /* @__PURE__ */ new Map();
            var s = [...l.current.keys()].filter((e) => (this.current.has(e) ? this.current.get(e)[0] !== e.v : !0));
            if (s.length > 0)
              for (let e of this.#u)
                !(e.f & 155648) && So(e, s, a) && (e.f & 4194320 ? (eo(e, oa), l.schedule(e)) : l.#d.add(e));
            if (l.#l.length > 0) {
              l.apply();
              for (var c of l.#l) l.#v(c, [], []);
              l.#l = [];
            }
            l.deactivate();
          }
        }
      }
    }
    increment(e, t) {
      if (((this.#o += 1), e)) {
        let e = this.#s.get(t) ?? 0;
        this.#s.set(t, e + 1);
      }
    }
    decrement(e, t) {
      if ((--this.#o, e)) {
        let e = this.#s.get(t) ?? 0;
        e === 1 ? this.#s.delete(t) : this.#s.set(t, e - 1);
      }
      this.#h ||
        ((this.#h = !0),
        Xa(() => {
          ((this.#h = !1), this.linked && this.flush());
        }));
    }
    transfer_effects(e, t) {
      for (let t of e) this.#d.add(t);
      for (let e of t) this.#f.add(e);
      (e.clear(), t.clear());
    }
    oncommit(e) {
      this.#r.add(e);
    }
    ondiscard(e) {
      this.#i.add(e);
    }
    on_fork_commit(e) {
      this.#a.add(e);
    }
    run_fork_commit_callbacks() {
      for (let e of this.#a) e(this);
      this.#a.clear();
    }
    settled() {
      return (this.#c ??= ia()).promise;
    }
    static ensure() {
      if (q === null) {
        let t = (q = new e());
        (t.#C(),
          !fo &&
            !uo &&
            Xa(() => {
              t.#e || t.flush();
            }));
      }
      return q;
    }
    apply() {
      if (!Ba || (!this.is_fork && this.#t === null && this.#n === null)) {
        co = null;
        return;
      }
      co = /* @__PURE__ */ new Map();
      for (let [e, [t]] of this.current) co.set(e, t);
      for (let t = ao; t !== null; t = t.#n)
        if (!(t === this || t.is_fork)) {
          var e = !1;
          if (t.id < this.id) {
            for (let [n, [, r]] of t.current)
              if (!r && this.current.has(n)) {
                e = !0;
                break;
              }
          }
          if (!e) for (let [e, n] of t.previous) co.has(e) || co.set(e, n);
        }
    }
    schedule(e) {
      if (((lo = e), e.b?.is_pending && e.f & 16777228 && !(e.f & 32768))) {
        e.b.defer_effect(e);
        return;
      }
      for (var t = e; t.parent !== null; ) {
        t = t.parent;
        var n = t.f;
        if (po !== null && t === X && (Ba || ((Y === null || !(Y.f & 2)) && !io))) return;
        if (n & 96) {
          if (!(n & 1024)) return;
          t.f ^= aa;
        }
      }
      this.#l.push(t);
    }
    #C() {
      (oo === null ? (ao = oo = this) : ((oo.#n = this), (this.#t = oo)), (oo = this));
    }
    #w() {
      var e = this.#t,
        t = this.#n;
      (e === null ? (ao = t) : (e.#n = t), t === null ? (oo = e) : (t.#t = e), (this.linked = !1));
    }
  };
function vo() {
  try {
    wa();
  } catch (e) {
    Qa(e, lo);
  }
}
var yo = null;
function bo(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        !(r.f & 24576) &&
        Ms(r) &&
        ((yo = /* @__PURE__ */ new Set()),
        Ls(r),
        r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && us(r),
        yo?.size > 0)
      ) {
        Io.clear();
        for (let e of yo) {
          if (e.f & 24576) continue;
          let t = [e],
            n = e.parent;
          for (; n !== null; ) (yo.has(n) && (yo.delete(n), t.push(n)), (n = n.parent));
          for (let e = t.length - 1; e >= 0; e--) {
            let n = t[e];
            n.f & 24576 || Ls(n);
          }
        }
        yo.clear();
      }
    }
    yo = null;
  }
}
function xo(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (let i of e.reactions) {
      let e = i.f;
      e & 2 ? xo(i, t, n, r) : e & 4194320 && !(e & 2048) && So(i, t, r) && (eo(i, oa), Co(i));
    }
}
function So(e, t, n) {
  let r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (let r of e.deps) {
      if (Ji.call(t, r)) return !0;
      if (r.f & 2 && So(r, t, n)) return (n.set(r, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function Co(e) {
  q.schedule(e);
}
function wo(e, t) {
  if (!(e.f & 32 && e.f & 1024)) {
    (e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), eo(e, aa));
    for (var n = e.first; n !== null; ) (wo(n, t), (n = n.next));
  }
}
function To(e) {
  eo(e, aa);
  for (var t = e.first; t !== null; ) (To(t), (t = t.next));
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function Eo(e) {
  let t = 0,
    n = Ro(0),
    r;
  return () => {
    $o() &&
      (Rs(n),
      ns(
        () => (
          t === 0 && (r = Vs(() => e(() => Uo(n)))),
          (t += 1),
          () => {
            Xa(() => {
              (--t, t === 0 && (r?.(), (r = void 0), Uo(n)));
            });
          }
        )
      ));
  };
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Do = fa | pa;
function Oo(e, t, n, r) {
  new ko(e, t, n, r);
}
var ko = class {
  parent;
  is_pending = !1;
  transform_error;
  #e;
  #t = Na ? Pa : null;
  #n;
  #r;
  #i;
  #a = null;
  #o = null;
  #s = null;
  #c = null;
  #l = 0;
  #u = 0;
  #d = !1;
  #f = /* @__PURE__ */ new Set();
  #p = /* @__PURE__ */ new Set();
  #m = null;
  #h = Eo(
    () => (
      (this.#m = Ro(this.#l)),
      () => {
        this.#m = null;
      }
    )
  );
  constructor(e, t, n, r) {
    ((this.#e = e),
      (this.#n = t),
      (this.#r = (e) => {
        var t = X;
        ((t.b = this), (t.f |= 128), n(e));
      }),
      (this.parent = X.b),
      (this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e)),
      (this.#i = rs(() => {
        if (Na) {
          let e = this.#t;
          Ia();
          let t = e.data === '[!';
          if (e.data.startsWith('[?')) {
            let t = JSON.parse(e.data.slice(2));
            this.#_(t);
          } else t ? this.#v() : this.#g();
        } else this.#y();
      }, Do)),
      Na && (this.#e = Pa));
  }
  #g() {
    try {
      this.#a = is(() => this.#r(this.#e));
    } catch (e) {
      this.error(e);
    }
  }
  #_(e) {
    let t = this.#n.failed;
    t &&
      (this.#s = is(() => {
        t(
          this.#e,
          () => e,
          () => () => {}
        );
      }));
  }
  #v() {
    let e = this.#n.pending;
    e &&
      ((this.is_pending = !0),
      (this.#o = is(() => e(this.#e))),
      Xa(() => {
        var e = (this.#c = document.createDocumentFragment()),
          t = Yo();
        (e.append(t),
          (this.#a = this.#x(() => is(() => this.#r(t)))),
          this.#u === 0 &&
            (this.#e.before(e),
            (this.#c = null),
            ds(this.#o, () => {
              this.#o = null;
            }),
            this.#b(q)));
      }));
  }
  #y() {
    try {
      if (
        ((this.is_pending = this.has_pending_snippet()),
        (this.#u = 0),
        (this.#l = 0),
        (this.#a = is(() => {
          this.#r(this.#e);
        })),
        this.#u > 0)
      ) {
        var e = (this.#c = document.createDocumentFragment());
        ps(this.#a, e);
        let t = this.#n.pending;
        this.#o = is(() => t(this.#e));
      } else this.#b(q);
    } catch (e) {
      this.error(e);
    }
  }
  #b(e) {
    ((this.is_pending = !1), e.transfer_effects(this.#f, this.#p));
  }
  defer_effect(e) {
    ro(e, this.#f, this.#p);
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  #x(e) {
    var t = X,
      n = Y,
      r = Ua;
    (bs(this.#i), ys(this.#i), Wa(this.#i.ctx));
    try {
      return (_o.ensure(), e());
    } catch (e) {
      return (Za(e), null);
    } finally {
      (bs(t), ys(n), Wa(r));
    }
  }
  #S(e, t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#S(e, t);
      return;
    }
    ((this.#u += e),
      this.#u === 0 &&
        (this.#b(t),
        this.#o &&
          ds(this.#o, () => {
            this.#o = null;
          }),
        (this.#c &&= (this.#e.before(this.#c), null))));
  }
  update_pending_count(e, t) {
    (this.#S(e, t),
      (this.#l += e),
      !(!this.#m || this.#d) &&
        ((this.#d = !0),
        Xa(() => {
          ((this.#d = !1), this.#m && Vo(this.#m, this.#l));
        })));
  }
  get_effect_pending() {
    return (this.#h(), Rs(this.#m));
  }
  error(e) {
    if (!this.#n.onerror && !this.#n.failed) throw e;
    q?.is_fork
      ? (this.#a && q.skip_effect(this.#a),
        this.#o && q.skip_effect(this.#o),
        this.#s && q.skip_effect(this.#s),
        q.on_fork_commit(() => {
          this.#C(e);
        }))
      : this.#C(e);
  }
  #C(e) {
    ((this.#a &&= (cs(this.#a), null)),
      (this.#o &&= (cs(this.#o), null)),
      (this.#s &&= (cs(this.#s), null)),
      Na && (Fa(this.#t), La(), Fa(Ra())));
    var t = this.#n.onerror;
    let n = this.#n.failed;
    var r = !1,
      i = !1;
    let a = () => {
        if (r) {
          Ma();
          return;
        }
        ((r = !0),
          i && Oa(),
          this.#s !== null &&
            ds(this.#s, () => {
              this.#s = null;
            }),
          this.#x(() => {
            this.#y();
          }));
      },
      o = (e) => {
        try {
          ((i = !0), t?.(e, a), (i = !1));
        } catch (e) {
          Qa(e, this.#i && this.#i.parent);
        }
        n &&
          (this.#s = this.#x(() => {
            try {
              return is(() => {
                var t = X;
                ((t.b = this),
                  (t.f |= 128),
                  n(
                    this.#e,
                    () => e,
                    () => a
                  ));
              });
            } catch (e) {
              return (Qa(e, this.#i.parent), null);
            }
          }));
      };
    Xa(() => {
      var t;
      try {
        t = this.transform_error(e);
      } catch (e) {
        Qa(e, this.#i && this.#i.parent);
        return;
      }
      typeof t == 'object' && t && typeof t.then == 'function'
        ? t.then(o, (e) => Qa(e, this.#i && this.#i.parent))
        : o(t);
    });
  }
};
function Ao(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) cs(t[n]);
  }
}
function jo(e) {
  var t,
    n = X,
    r = e.parent;
  if (!gs && r !== null && r.f & 24576) return (Aa(), e.v);
  bs(r);
  try {
    ((e.f &= ~ha), Ao(e), (t = Ps(e)));
  } finally {
    bs(n);
  }
  return t;
}
function Mo(e) {
  var t = jo(e);
  if (
    !e.equals(t) &&
    ((e.wv = js()),
    (!q?.is_fork || e.deps === null) &&
      (q === null ? (e.v = t) : (q.capture(e, t, !0), so?.capture(e, t, !0)), e.deps === null))
  ) {
    eo(e, aa);
    return;
  }
  gs || (co === null ? to(e) : ($o() || q?.is_fork) && co.set(e, t));
}
function No(e) {
  if (e.effects !== null)
    for (let t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Ca), (t.teardown = na), (t.ac = null), Is(t, 0), os(t));
}
function Po(e) {
  if (e.effects !== null) for (let t of e.effects) t.teardown && Ls(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Fo = /* @__PURE__ */ new Set(),
  Io = /* @__PURE__ */ new Map(),
  Lo = !1;
function Ro(e, t) {
  return {
    f: 0,
    v: e,
    reactions: null,
    equals: za,
    rv: 0,
    wv: 0
  };
}
/*#__NO_SIDE_EFFECTS__*/
function zo(e, t) {
  let n = Ro(e, t);
  return (Ss(n), n);
}
function Bo(e, t, n = !1) {
  return (
    Y !== null && (!vs || Y.f & 131072) && qa() && Y.f & 4325394 && (xs === null || !Ji.call(xs, e)) && Da(),
    Vo(e, n ? Go(t) : t, mo)
  );
}
function Vo(e, t, n = null) {
  if (!e.equals(t)) {
    Io.set(e, gs ? t : e.v);
    var r = _o.ensure();
    if ((r.capture(e, t), e.f & 2)) {
      let t = e;
      (e.f & 2048 && jo(t), co === null && to(t));
    }
    ((e.wv = js()),
      Wo(e, oa, n),
      qa() && X !== null && X.f & 1024 && !(X.f & 96) && (Ts === null ? Es([e]) : Ts.push(e)),
      !r.is_fork && Fo.size > 0 && !Lo && Ho());
  }
  return t;
}
function Ho() {
  Lo = !1;
  for (let e of Fo) {
    e.f & 1024 && eo(e, sa);
    let t;
    try {
      t = Ms(e);
    } catch {
      t = !0;
    }
    t && Ls(e);
  }
  Fo.clear();
}
function Uo(e) {
  Bo(e, e.v + 1);
}
function Wo(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = qa(), a = r.length, o = 0; o < a; o++) {
      var s = r[o],
        c = s.f;
      if (!(!i && s === X)) {
        var l = (c & oa) === 0;
        if ((l && eo(s, t), c & 131072)) Fo.add(s);
        else if (c & 2) {
          var u = s;
          (co?.delete(u), c & 65536 || (c & 512 && (X === null || !(X.f & 2097152)) && (s.f |= ha), Wo(u, sa, n)));
        } else if (l) {
          var d = s;
          (c & 16 && yo !== null && yo.add(d), n === null ? Co(d) : n.push(d));
        }
      }
    }
}
function Go(e) {
  if (typeof e != 'object' || !e || va in e) return e;
  let t = ea(e);
  if (t !== Qi && t !== $i) return e;
  var n = /* @__PURE__ */ new Map(),
    r = Ki(e),
    i = /* @__PURE__ */ zo(0),
    a = null,
    o = ks,
    s = (e) => {
      if (ks === o) return e();
      var t = Y,
        n = ks;
      (ys(null), As(o));
      var r = e();
      return (ys(t), As(n), r);
    };
  return (
    r && n.set('length', /* @__PURE__ */ zo(e.length, a)),
    new Proxy(e, {
      defineProperty(e, t, r) {
        (!('value' in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && Ta();
        var i = n.get(t);
        return (
          i === void 0
            ? s(() => {
                var e = /* @__PURE__ */ zo(r.value, a);
                return (n.set(t, e), e);
              })
            : Bo(i, r.value, !0),
          !0
        );
      },
      deleteProperty(e, t) {
        var r = n.get(t);
        if (r === void 0) {
          if (t in e) {
            let e = s(() => /* @__PURE__ */ zo(ka, a));
            (n.set(t, e), Uo(i));
          }
        } else (Bo(r, ka), Uo(i));
        return !0;
      },
      get(t, r, i) {
        if (r === va) return e;
        var o = n.get(r),
          c = r in t;
        if (
          (o === void 0 &&
            (!c || Zi(t, r)?.writable) &&
            ((o = s(() => /* @__PURE__ */ zo(Go(c ? t[r] : ka), a))), n.set(r, o)),
          o !== void 0)
        ) {
          var l = Rs(o);
          return l === ka ? void 0 : l;
        }
        return Reflect.get(t, r, i);
      },
      getOwnPropertyDescriptor(e, t) {
        var r = Reflect.getOwnPropertyDescriptor(e, t);
        if (r && 'value' in r) {
          var i = n.get(t);
          i && (r.value = Rs(i));
        } else if (r === void 0) {
          var a = n.get(t),
            o = a?.v;
          if (a !== void 0 && o !== ka)
            return {
              enumerable: !0,
              configurable: !0,
              value: o,
              writable: !0
            };
        }
        return r;
      },
      has(e, t) {
        if (t === va) return !0;
        var r = n.get(t),
          i = (r !== void 0 && r.v !== ka) || Reflect.has(e, t);
        return (r !== void 0 || (X !== null && (!i || Zi(e, t)?.writable))) &&
          (r === void 0 && ((r = s(() => /* @__PURE__ */ zo(i ? Go(e[t]) : ka, a))), n.set(t, r)), Rs(r) === ka)
          ? !1
          : i;
      },
      set(e, t, o, c) {
        var l = n.get(t),
          u = t in e;
        if (r && t === 'length')
          for (var d = o; d < l.v; d += 1) {
            var f = n.get(d + '');
            f === void 0 ? d in e && ((f = s(() => /* @__PURE__ */ zo(ka, a))), n.set(d + '', f)) : Bo(f, ka);
          }
        if (l === void 0)
          (!u || Zi(e, t)?.writable) && ((l = s(() => /* @__PURE__ */ zo(void 0, a))), Bo(l, Go(o)), n.set(t, l));
        else {
          u = l.v !== ka;
          var p = s(() => Go(o));
          Bo(l, p);
        }
        var m = Reflect.getOwnPropertyDescriptor(e, t);
        if ((m?.set && m.set.call(c, o), !u)) {
          if (r && typeof t == 'string') {
            var h = n.get('length'),
              g = Number(t);
            Number.isInteger(g) && g >= h.v && Bo(h, g + 1);
          }
          Uo(i);
        }
        return !0;
      },
      ownKeys(e) {
        Rs(i);
        var t = Reflect.ownKeys(e).filter((e) => {
          var t = n.get(e);
          return t === void 0 || t.v !== ka;
        });
        for (var [r, a] of n) a.v !== ka && !(r in e) && t.push(r);
        return t;
      },
      setPrototypeOf() {
        Ea();
      }
    })
  );
}
new Set(['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']);
var Ko, qo;
function Jo() {
  if (Ko === void 0) {
    ((Ko = window), /Firefox/.test(navigator.userAgent));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    (Zi(t, 'firstChild').get,
      (qo = Zi(t, 'nextSibling').get),
      ta(e) && ((e[ba] = void 0), (e[ya] = null), (e[xa] = void 0), (e.__e = void 0)),
      ta(n) && (n[Sa] = void 0));
  }
}
function Yo(e = '') {
  return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Xo(e) {
  return qo.call(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function J(e) {
  var t = Y,
    n = X;
  (ys(null), bs(null));
  try {
    return e();
  } finally {
    (ys(t), bs(n));
  }
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function Zo(e, t) {
  var n = t.last;
  n === null ? (t.last = t.first = e) : ((n.next = e), (e.prev = n), (t.last = e));
}
function Qo(e, t) {
  var n = X;
  n !== null && n.f & 8192 && (e |= ca);
  var r = {
    ctx: Ua,
    deps: null,
    nodes: null,
    f: e | oa | 512,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  q?.register_created_effect(r);
  var i = r;
  if (e & 4) po === null ? _o.ensure().schedule(r) : po.push(r);
  else if (t !== null) {
    try {
      Ls(r);
    } catch (e) {
      throw (cs(r), e);
    }
    i.deps === null &&
      i.teardown === null &&
      i.nodes === null &&
      i.first === i.last &&
      !(i.f & 524288) &&
      ((i = i.first), e & 16 && e & 65536 && i !== null && (i.f |= fa));
  }
  if (i !== null && ((i.parent = n), n !== null && Zo(i, n), Y !== null && Y.f & 2 && !(e & 64))) {
    var a = Y;
    (a.effects ??= []).push(i);
  }
  return r;
}
function $o() {
  return Y !== null && !vs;
}
function es(e) {
  return Qo(4 | ma, e);
}
function ts(e) {
  _o.ensure();
  let t = Qo(64 | pa, e);
  return (e = {}) =>
    new Promise((n) => {
      e.outro
        ? ds(t, () => {
            (cs(t), n(void 0));
          })
        : (cs(t), n(void 0));
    });
}
function ns(e, t = 0) {
  return Qo(8 | t, e);
}
function rs(e, t = 0) {
  return Qo(16 | t, e);
}
function is(e) {
  return Qo(32 | pa, e);
}
function as(e) {
  var t = e.teardown;
  if (t !== null) {
    let e = gs,
      n = Y;
    (_s(!0), ys(null));
    try {
      t.call(null);
    } finally {
      (_s(e), ys(n));
    }
  }
}
function os(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    let e = n.ac;
    e !== null &&
      J(() => {
        e.abort(Ca);
      });
    var r = n.next;
    (n.f & 64 ? (n.parent = null) : cs(n, t), (n = r));
  }
}
function ss(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & 32 || cs(t), (t = n));
  }
}
function cs(e, t = !0) {
  var n = !1;
  ((t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (ls(e.nodes.start, e.nodes.end), (n = !0)),
    eo(e, da),
    os(e, t && !n),
    Is(e, 0));
  var r = e.nodes && e.nodes.t;
  if (r !== null) for (let e of r) e.stop();
  (as(e), (e.f ^= da), (e.f |= la));
  var i = e.parent;
  (i !== null && i.first !== null && us(e),
    (e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null));
}
function ls(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Xo(e);
    (e.remove(), (e = n));
  }
}
function us(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function ds(e, t, n = !0) {
  var r = [];
  fs(e, r, !0);
  var i = () => {
      (n && cs(e), t && t());
    },
    a = r.length;
  if (a > 0) {
    var o = () => --a || i();
    for (var s of r) s.out(o);
  } else i();
}
function fs(e, t, n) {
  if (!(e.f & 8192)) {
    e.f ^= ca;
    var r = e.nodes && e.nodes.t;
    if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
    for (var i = e.first; i !== null; ) {
      var a = i.next;
      if (!(i.f & 64)) {
        var o = (i.f & 65536) != 0 || ((i.f & 32) != 0 && (e.f & 16) != 0);
        fs(i, t, o ? n : !1);
      }
      i = a;
    }
  }
}
function ps(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Xo(n);
      (t.append(n), (n = i));
    }
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var ms = null,
  hs = !1,
  gs = !1;
function _s(e) {
  gs = e;
}
var Y = null,
  vs = !1;
function ys(e) {
  Y = e;
}
var X = null;
function bs(e) {
  X = e;
}
var xs = null;
function Ss(e) {
  Y !== null && (!Ba || Y.f & 2) && (xs === null ? (xs = [e]) : xs.push(e));
}
var Cs = null,
  ws = 0,
  Ts = null;
function Es(e) {
  Ts = e;
}
var Ds = 1,
  Os = 0,
  ks = Os;
function As(e) {
  ks = e;
}
function js() {
  return ++Ds;
}
function Ms(e) {
  var t = e.f;
  if (t & 2048) return !0;
  if ((t & 2 && (e.f &= ~ha), t & 4096)) {
    for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if ((Ms(a) && Mo(a), a.wv > e.wv)) return !0;
    }
    t & 512 && co === null && eo(e, aa);
  }
  return !1;
}
function Ns(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(!Ba && xs !== null && Ji.call(xs, e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      a.f & 2 ? Ns(a, t, !1) : t === a && (n ? eo(a, oa) : a.f & 1024 && eo(a, sa), Co(a));
    }
}
function Ps(e) {
  var t = Cs,
    n = ws,
    r = Ts,
    i = Y,
    a = xs,
    o = Ua,
    s = vs,
    c = ks,
    l = e.f;
  ((Cs = null),
    (ws = 0),
    (Ts = null),
    (Y = l & 96 ? null : e),
    (xs = null),
    Wa(e.ctx),
    (vs = !1),
    (ks = ++Os),
    e.ac !== null &&
      (J(() => {
        e.ac.abort(Ca);
      }),
      (e.ac = null)));
  try {
    e.f |= ga;
    var u = e.fn,
      d = u();
    e.f |= ua;
    var f = e.deps,
      p = q?.is_fork;
    if (Cs !== null) {
      var m;
      if ((p || Is(e, ws), f !== null && ws > 0))
        for (f.length = ws + Cs.length, m = 0; m < Cs.length; m++) f[ws + m] = Cs[m];
      else e.deps = f = Cs;
      if ($o() && e.f & 512) for (m = ws; m < f.length; m++) (f[m].reactions ??= []).push(e);
    } else !p && f !== null && ws < f.length && (Is(e, ws), (f.length = ws));
    if (qa() && Ts !== null && !vs && f !== null && !(e.f & 6146)) for (m = 0; m < Ts.length; m++) Ns(Ts[m], e);
    if (i !== null && i !== e) {
      if ((Os++, i.deps !== null)) for (let e = 0; e < n; e += 1) i.deps[e].rv = Os;
      if (t !== null) for (let e of t) e.rv = Os;
      Ts !== null && (r === null ? (r = Ts) : r.push(...Ts));
    }
    return (e.f & 8388608 && (e.f ^= _a), d);
  } catch (e) {
    return Za(e);
  } finally {
    ((e.f ^= ga), (Cs = t), (ws = n), (Ts = r), (Y = i), (xs = a), Wa(o), (vs = s), (ks = c));
  }
}
function Fs(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = qi.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? (n = t.reactions = null) : ((n[r] = n[i]), n.pop());
    }
  }
  if (n === null && t.f & 2 && (Cs === null || !Ji.call(Cs, t))) {
    var a = t;
    (a.f & 512 && ((a.f ^= 512), (a.f &= ~ha)), a.v !== ka && to(a), No(a), Is(a, 0));
  }
}
function Is(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) Fs(e, n[r]);
}
function Ls(e) {
  var t = e.f;
  if (!(t & 16384)) {
    eo(e, aa);
    var n = X,
      r = hs;
    ((X = e), (hs = !0));
    try {
      (t & 16777232 ? ss(e) : os(e), as(e));
      var i = Ps(e);
      ((e.teardown = typeof i == 'function' ? i : null), (e.wv = Ds));
    } finally {
      ((hs = r), (X = n));
    }
  }
}
function Rs(e) {
  var t = (e.f & 2) != 0;
  if ((ms?.add(e), Y !== null && !vs && !(X !== null && X.f & 16384) && (xs === null || !Ji.call(xs, e)))) {
    var n = Y.deps;
    if (Y.f & 2097152)
      e.rv < Os &&
        ((e.rv = Os), Cs === null && n !== null && n[ws] === e ? ws++ : Cs === null ? (Cs = [e]) : Cs.push(e));
    else {
      (Y.deps ??= []).push(e);
      var r = e.reactions;
      r === null ? (e.reactions = [Y]) : Ji.call(r, Y) || r.push(Y);
    }
  }
  if (gs && Io.has(e)) return Io.get(e);
  if (t) {
    var i = e;
    if (gs) {
      var a = i.v;
      return (((!(i.f & 1024) && i.reactions !== null) || Bs(i)) && (a = jo(i)), Io.set(i, a), a);
    }
    var o = (i.f & 512) == 0 && !vs && Y !== null && (hs || (Y.f & 512) != 0),
      s = (i.f & ua) === 0;
    (Ms(i) && (o && (i.f |= 512), Mo(i)), o && !s && (Po(i), zs(i)));
  }
  if (co?.has(e)) return co.get(e);
  if (e.f & 8388608) throw e.v;
  return e.v;
}
function zs(e) {
  if (((e.f |= 512), e.deps !== null))
    for (let t of e.deps) ((t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Po(t), zs(t)));
}
function Bs(e) {
  if (e.v === ka) return !0;
  if (e.deps === null) return !1;
  for (let t of e.deps) if (Io.has(t) || (t.f & 2 && Bs(t))) return !0;
  return !1;
}
function Vs(e) {
  var t = vs;
  try {
    return ((vs = !0), e());
  } finally {
    vs = t;
  }
}
[
  .../* @__PURE__ */ 'allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback'.split(
    '.'
  )
];
var Hs = ['touchstart', 'touchmove'];
function Us(e) {
  return Hs.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var Ws = Symbol('events'),
  Gs = /* @__PURE__ */ new Set(),
  Ks = /* @__PURE__ */ new Set(),
  qs = null;
function Js(e) {
  var t = this,
    n = t.ownerDocument,
    r = e.type,
    i = e.composedPath?.() || [],
    a = i[0] || e.target;
  qs = e;
  var o = 0,
    s = qs === e && e[Ws];
  if (s) {
    var c = i.indexOf(s);
    if (c !== -1 && (t === document || t === window)) {
      e[Ws] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1) return;
    c <= l && (o = c);
  }
  if (((a = i[o] || e.target), a !== t)) {
    Xi(e, 'currentTarget', {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var u = Y,
      d = X;
    (ys(null), bs(null));
    try {
      for (var f, p = []; a !== null; ) {
        var m = a.assignedSlot || a.parentNode || a.host || null;
        try {
          var h = a[Ws]?.[r];
          h != null && (!a.disabled || e.target === a) && h.call(a, e);
        } catch (e) {
          f ? p.push(e) : (f = e);
        }
        if (e.cancelBubble || m === t || m === null) break;
        a = m;
      }
      if (f) {
        for (let e of p)
          queueMicrotask(() => {
            throw e;
          });
        throw f;
      }
    } finally {
      ((e[Ws] = t), delete e.currentTarget, ys(u), bs(d));
    }
  }
}
globalThis?.window?.trustedTypes;
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Ys(e, t) {
  var n = X;
  n.nodes === null &&
    (n.nodes = {
      start: e,
      end: t,
      a: null,
      t: null
    });
}
function Xs(e, t) {
  return Qs(e, t);
}
var Zs = /* @__PURE__ */ new Map();
function Qs(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: o = !0, transformError: s }) {
  Jo();
  var c = void 0,
    l = ts(() => {
      var o = n ?? t.appendChild(Yo());
      Oo(
        o,
        { pending: () => {} },
        (t) => {
          Ga({});
          var n = Ua;
          if (
            (a && (n.c = a),
            i && (r.$$events = i),
            Na && Ys(t, null),
            (c = e(t, r) || {}),
            Na && ((X.nodes.end = Pa), Pa === null || Pa.nodeType !== 8 || Pa.data !== ']'))
          )
            throw (ja(), K);
          Ka();
        },
        s
      );
      var l = /* @__PURE__ */ new Set(),
        u = (e) => {
          for (var n = 0; n < e.length; n++) {
            var r = e[n];
            if (!l.has(r)) {
              l.add(r);
              var i = Us(r);
              for (let e of [t, document]) {
                var a = Zs.get(e);
                a === void 0 && ((a = /* @__PURE__ */ new Map()), Zs.set(e, a));
                var o = a.get(r);
                o === void 0 ? (e.addEventListener(r, Js, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
              }
            }
          }
        };
      return (
        u(Yi(Gs)),
        Ks.add(u),
        () => {
          for (var e of l)
            for (let n of [t, document]) {
              var r = Zs.get(n),
                i = r.get(e);
              --i == 0 ? (n.removeEventListener(e, Js), r.delete(e), r.size === 0 && Zs.delete(n)) : r.set(e, i);
            }
          (Ks.delete(u), o !== n && o.parentNode?.removeChild(o));
        }
      );
    });
  return ($s.set(c, l), c);
}
var $s = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
(typeof window < 'u' && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add('5'), Ha());
//#endregion
//#region src/App.svelte
function ec(e) {}
//#endregion
//#region src/modules/routing-module.ts
var tc = {
    init: (e) => {
      W.get(Si).enableRouting();
    },
    handlePageErrorHandler: (e, t, n) => {
      e &&
        e.timeout &&
        setTimeout(() => {
          if (e.viewUrl) ((t.viewUrl = e.viewUrl), n.getEngine()._ui.updateMainContent(t, n));
          else if (e.errorFn) e.errorFn(t);
          else {
            console.warn('Something went wrong with a client! You will be redirected to another page.');
            let t = e.redirectPath || '/';
            n.navigation().navigate(t);
          }
        }, e.timeout);
    },
    handleExternalLinkNavigation: (e) => {
      if (e.url)
        if (e.sameWindow) window.location.href = e.url;
        else {
          let t = window.open(e.url, '_blank', 'noopener noreferrer');
          t && ((t.opener = null), t.focus());
        }
    },
    async addSearchParamsFromClient(e, t, n, r) {
      let i = W.get(yi),
        a = U.getCurrentPath(r, r.getConfig().routing?.useHashRouting),
        o = (await i.getCurrentNode(a.path))?.clientPermissions?.urlParameters,
        s = { ...e };
      if (o) {
        let e = {};
        Object.keys(o).forEach((t) => {
          t in s && o[t]?.write === !0 && ((e[t] = s[t]), delete s[t]);
        });
        for (let e in s) console.warn(`No permission to add the search param "${e}" to the url`);
        Object.keys(e).length > 0 && r.routing().addSearchParams(e, t, n);
      }
    }
  },
  nc,
  rc = {
    luigi: void 0,
    documentTitle: void 0,
    init: (e) => {
      ((rc.luigi = e), (rc.documentTitle = r(void 0)), (nc = W.get(gi)));
    },
    processAlert: (e, t, n) => {
      if (!rc.luigi) throw Error('Luigi is not initialized.');
      let r = {
        openFromClient: t,
        close: () => {
          e.id && n.notifyAlertClosed(e.id);
        },
        link: (t) => {
          if (e.links) {
            let r = e.links[t];
            if (r && (r.url && rc.luigi?.navigation().navigate(r.url), r.dismissKey && e.id))
              return (n.notifyAlertClosed(e.id, r.dismissKey), !0);
          }
          return !1;
        }
      };
      rc.luigi.getEngine()._connector?.renderAlert(e, r);
    },
    handleConfirmationModalRequest: (e, t) => {
      if (!rc.luigi) throw Error('Luigi is not initialized.');
      if (e) {
        let t = e.body ? e.body : rc.luigi.i18n().getTranslation('luigi.confirmationModal.body');
        e = {
          ...e,
          header: rc.luigi.i18n().getTranslation(e.header || 'luigi.confirmationModal.header'),
          body: fi.sanatizeHtmlExceptTextFormatting(t),
          buttonDismiss: rc.luigi.i18n().getTranslation(e.buttonDismiss || 'luigi.button.dismiss'),
          buttonConfirm:
            e.buttonConfirm === !1 ? !1 : rc.luigi.i18n().getTranslation(e.buttonConfirm || 'luigi.button.confirm')
        };
      }
      rc.luigi.getEngine()._connector?.renderConfirmationModal(e, {
        confirm() {
          t.notifyConfirmationModalClosed(!0);
        },
        dismiss() {
          t.notifyConfirmationModalClosed(!1);
        }
      });
    },
    handleDirtyStatusRequest: (e, t) => {
      if (!rc.luigi) throw Error('Luigi is not initialized.');
      nc.updateDirtyStatus(e, t);
    }
  },
  ic = class {
    static hasLocaleChangePermission(e) {
      return e?.clientPermissions?.changeCurrentLocale
        ? !0
        : (console.error(
            'Current locale change declined from client, as client permission "changeCurrentLocale" is not set for this view.'
          ),
          !1);
    }
  };
//#endregion
//#region src/modules/communicaton-module.ts
function ac(e, t, n) {
  let r = n.getConfigValue('navigation.viewGroupSettings') || {};
  (r[e] || (r[e] = {}), (r[e]._liveCustomData = t), n.configChanged('navigation.viewgroupdata'));
}
var oc = {
  luigi: {},
  init: (e) => {
    oc.luigi = e;
  },
  addListeners: (e, t) => {
    (e.addEventListener(V.INITIALIZED, (t) => {
      rc.luigi?.ux().hideLoadingIndicator(e.parentNode);
      let n = W.get(bi);
      (n.viewGroupLoaded(e), !e._luigiPreloading && e.style.display !== 'none' && n.preload());
    }),
      e.addEventListener(V.NAVIGATION_COMPLETED_REPORT, () => {
        W.get(bi).preload();
      }),
      e.addEventListener(V.NAVIGATION_REQUEST, (e) => {
        let {
            drawer: t,
            link: n,
            intent: r,
            preserveView: i,
            modal: a,
            newTab: o,
            withoutSync: s,
            preventContextUpdate: c,
            preventHistoryEntry: l,
            fromVirtualTreeRoot: u,
            fromContext: d,
            fromClosestContext: f,
            fromParent: p,
            relative: m,
            nodeParams: h
          } = e.detail,
          g = {
            drawerSettings: t,
            intent: r,
            modalSettings: a,
            newTab: o,
            path: n,
            preserveView: i,
            preventContextUpdate: c,
            options: {
              fromVirtualTreeRoot: u,
              fromContext: d,
              fromClosestContext: f,
              fromParent: p,
              relative: m,
              nodeParams: h
            },
            preventHistoryEntry: l,
            withoutSync: s
          };
        W.get(yi).handleNavigationRequest(g, (t) => e.callback(t));
      }),
      e.addEventListener(V.RUNTIME_ERROR_HANDLING_REQUEST, (e) => {
        let n = e.payload;
        t.navigation().runTimeErrorHandler(n?.data?.errorObj || {});
      }),
      e.addEventListener(V.ALERT_REQUEST, (t) => {
        rc.processAlert(t.payload, !0, e);
      }),
      e.addEventListener(V.SHOW_CONFIRMATION_MODAL_REQUEST, (t) => {
        rc.handleConfirmationModalRequest(t.payload, e);
      }),
      e.addEventListener(V.SET_DOCUMENT_TITLE_REQUEST, (e) => {
        let t = e.detail;
        oc.luigi.getEngine()._connector?.setDocumentTitle(t.title);
      }),
      e.addEventListener(V.SHOW_LOADING_INDICATOR_REQUEST, () => {
        oc.luigi.getEngine()._connector?.showLoadingIndicator(e.parentNode);
      }),
      e.addEventListener(V.HIDE_LOADING_INDICATOR_REQUEST, () => {
        oc.luigi.getEngine()._connector?.hideLoadingIndicator(e.parentNode);
      }),
      e.addEventListener(V.ADD_BACKDROP_REQUEST, () => {
        oc.luigi.getEngine()._connector?.addBackdrop();
      }),
      e.addEventListener(V.REMOVE_BACKDROP_REQUEST, () => {
        oc.luigi.getEngine()._connector?.removeBackdrop();
      }),
      e.addEventListener(V.SET_ANCHOR_LINK_REQUEST, (n) => {
        let r = n?.payload || '';
        ((e.anchor = r), e.updateContext(e.context || {}), t.routing().setAnchor(r));
      }),
      e.addEventListener(V.SET_DIRTY_STATUS_REQUEST, (t) => {
        let n = t.payload;
        rc.handleDirtyStatusRequest(n?.dirty ?? !1, e);
      }),
      e.addEventListener(V.ADD_NODE_PARAMS_REQUEST, (e) => {
        let n = e.payload;
        t.routing().addNodeParams(n.data, n.keepBrowserHistory);
      }),
      e.addEventListener(V.COLLAPSE_LEFT_NAV_REQUEST, (e) => {
        let n = e.payload;
        t.ux().collapseLeftSideNav(n.state);
      }),
      e.addEventListener(V.OPEN_USER_SETTINGS_REQUEST, () => {
        t.ux().openUserSettings();
      }),
      e.addEventListener(V.CLOSE_USER_SETTINGS_REQUEST, () => {
        oc.luigi.getEngine()._connector?.closeUserSettings();
      }),
      e.addEventListener(V.ADD_SEARCH_PARAMS_REQUEST, (e) => {
        let n = e.detail;
        tc.addSearchParamsFromClient(n.data, n.keepBrowserHistory, n.preventLuigiConfigUpdate, t);
      }),
      e.addEventListener(V.UPDATE_MODAL_SETTINGS_REQUEST, (e) => {
        let n = e.payload;
        G.updateModalSettings(n.updatedModalSettings, n.addHistoryEntry, t);
      }),
      e.addEventListener(V.SET_CURRENT_LOCALE_REQUEST, (n) => {
        if (!ic.hasLocaleChangePermission(e)) return;
        let r = n.detail?.data?.data?.currentLocale;
        r && t.i18n().setCurrentLocale(r);
      }),
      e.addEventListener(V.GET_CURRENT_ROUTE_REQUEST, (e) => {
        let t = e.payload;
        W.get(yi)
          .getCurrentRoutePath(t)
          .then((t) => {
            e.callback(t);
          })
          .catch(() => e.callback(''));
      }),
      e.addEventListener(V.SET_VIEW_GROUP_DATA_REQUEST, (n) => {
        let r = e.viewGroup;
        r && ac(r, n.detail, t);
      }));
  }
};
//#endregion
//#region src/main.ts
window.Luigi = new Gi(
  new (class {
    config;
    _connector;
    _app;
    _ui = G;
    _comm = oc;
    _ux = rc;
    _routing = tc;
    bootstrap(e) {
      ((this._app = Xs(ec, { target: document.body })), (this._connector = e));
    }
    init() {
      let e = window.Luigi;
      (W.register(gi, () => new gi(e)),
        W.register(Ii, () => new Ii(e)),
        W.register(yi, () => new yi(e)),
        W.register(vi, () => new vi()),
        W.register(Si, () => new Si(e)),
        W.register(Ci, () => new Ci()),
        W.register(_i, () => new _i(e)),
        W.register(bi, () => new bi(e)),
        e.theming()._init(),
        G.init(e),
        tc.init(e),
        oc.init(e),
        rc.init(e));
    }
  })()
);
//#endregion

//# sourceMappingURL=luigi.js.map
