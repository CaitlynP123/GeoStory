import plotly.express as px

df = px.data.gapminder().query("year == 2024")

fig = px.choropleth(df, locations="iso_alpha",
                    color="gdpPercap",
                    hover_name="country",
                    color_continuous_scale=px.colors.sequential.Plasma,
                    projection="natural earth")

fig.show()
