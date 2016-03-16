<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<title><%= request.getParameter("name") %></title>
<style type="text/css">
body, html{width: 100%;height: 100%;overflow: hidden;margin:0;}
</style>
<script src="https://sapi.map.baidu.com/components?ak=ilzHNEmlYFfKe4o4HwuPG37c&v=1.0"></script>
</head>
<body>
<lbs-map width="100%" style="height:100%" center="<%= request.getParameter("lon") %>,<%= request.getParameter("lat") %>">
  <lbs-poi name="<%= request.getParameter("name") %>" location="<%= request.getParameter("lon") %>,<%= request.getParameter("lat") %>" addr="<%= request.getParameter("desc") %>" ></lbs-poi>
</lbs-map>
</body>
</html>