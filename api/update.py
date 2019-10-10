#!/usr/bin/env python3
import lib
import alpha

lib.upgrade()
alpha.historical(list(set([
  "BAC", "ARCH", "S", "ORCL", "BBY",
  "F", "SPLS", "SIRI", "SQ", "CL"
  "GM", "FTR", "BABA", "NKE", "GIS",
  "WFC", "HRB", "PLUG", "GS", "LVS",
  "V", "T", "LLY", "TWLO", "KSS", "LYFT",
  "VZ", "CTL", "QCOM", "MS", "ETSY",
  "TWTR", "MAT", "ROKU", "AMGN", "AAL",
  "GE", "ULTA", "INTC", "LOW", "FL",
  "GRPN", "LULU", "AMD", "KHC", "MGM",
  "PFE", "DPZ", "NVDA", "AXP", "M", "IBM",
  "CVX", "PCG", "C", "ATVI", "KR", "PINS",
  "JPM", "HCC", "HD", "EBAY", "HAL", "TGT",
  "JNJ", "FSLR", "DG", "DAL", "ACB", "DOW",
  "MMM", "FIT", "PG", "ZM", "HPQ", "UPS",
  "UBER", "GPRO", "ADBE", "TMUS", "WDC",
  "SFIX", "ZNGA", "CVS", "LUV", "MET",

  "AAPL","MSFT","SNAP","FB","PEP","KO","TSLA","XOM","AMZN","WMT","NFLX","DIS","GOOG","BIDU","V","PYPL","PM","PLNT"])))

alpha.historical([
  # Goldman sachs
  "GSLC","GSEW",
  # Schwab broad market & large cap
  "SCHB","SCHV",
  # DJIA ETF by SPDR
  "DIA",
  # NASDAQ ETF by Fidelity 
  "ONEQ",
  # S&P 500 ETF by Vanguard & their broad market
  "VOO", "VTI",
  # Russell 2000 ETF by iShares 
  "IWM"
])

