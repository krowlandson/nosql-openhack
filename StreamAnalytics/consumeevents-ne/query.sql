SELECT
    GetMetadataPropertyValue(eventorder, 'EventId') as id,
    *    
INTO
    [eventtarget]
FROM
    [eventorder]

SELECT
    GetMetadataPropertyValue(eventorder, 'EventId') as id,
    *    
INTO
    [eventtarget-cosmoslink]
FROM
    [eventorder]

SELECT 
    DATEPART(dy,System.Timestamp()) AS Agr_Dayofyear, DATEPART(minute,System.Timestamp()) AS Agr_Hour, SUM(Total) AS Revenue, COUNT(*) AS NumOfOrders
INTO
    [eventagregate]
FROM
    [eventorder]   
GROUP BY 
    Agr_Dayofyear, Agr_Hour, TumblingWindow(Duration(minute, 1), Offset(millisecond, -1))

SELECT 
    DATEPART(dy,System.Timestamp()) AS Agr_Dayofyear, DATEPART(minute,System.Timestamp()) AS Agr_Hour, SUM(Total) AS Revenue, COUNT(*) AS NumOfOrders
INTO
    [hacker5powerbi]
FROM
    [eventorder]   
GROUP BY 
    Agr_Dayofyear, Agr_Hour, TumblingWindow(Duration(minute, 1), Offset(millisecond, -1))

SELECT 
    DATEPART(dy,System.Timestamp()) AS Agr_Dayofyear, DATEPART(minute,System.Timestamp()) AS Agr_Hour, SUM(Total) AS Revenue, COUNT(*) AS NumOfOrders
INTO
    [WtreamPowerBIteam6]
FROM
    [eventorder]   
GROUP BY 
    Agr_Dayofyear, Agr_Hour, TumblingWindow(Duration(minute, 1), Offset(millisecond, -1))
