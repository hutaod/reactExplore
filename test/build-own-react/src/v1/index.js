import { h, Fragment } from './h'
import { render } from './reconciler.fre'
import { useState, useReducer, useEffect, useMemo, useCallback, useRef, useLayout } from './hooks'

const mixins = {}

export {
  h,
  h as jsx,
  h as jsxs,
  h as jsxDEV,
  render,
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayout,
  useLayout as useLayoutEffect,
  Fragment,
  mixins,
}
